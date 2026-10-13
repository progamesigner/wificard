import { describe, expect, it } from 'vitest'

import { localeFromSearchParams, normalizeLocale, resolveLocale } from './locales'

describe('normalizeLocale', () => {
  it.each([
    ['en', 'en'],
    ['en-US', 'en'],
    ['EN-gb', 'en'],
    ['zh-Hant', 'zh-TW'],
    ['zh-Hant-TW', 'zh-TW'],
    ['zh-hant-hk', 'zh-TW'],
    ['zh-Hans', 'zh-CN'],
    ['zh-Hans-CN', 'zh-CN'],
    ['zh-TW', 'zh-TW'],
    ['zh-HK', 'zh-TW'],
    ['zh-MO', 'zh-TW'],
    ['zh-CN', 'zh-CN'],
    ['zh-SG', 'zh-CN'],
    ['zh_TW', 'zh-TW'],
  ])('maps %s to %s', (tag, expected) => {
    expect(normalizeLocale(tag)).toBe(expected)
  })

  it('lets an explicit script win over the region', () => {
    expect(normalizeLocale('zh-Hans-TW')).toBe('zh-CN')
    expect(normalizeLocale('zh-Hant-CN')).toBe('zh-TW')
  })

  it.each(['zh', 'zh-US', 'zh-Latn', 'ja', 'ja-JP', 'fr', '', '  ', 'en-', '-en', 'e', '<en>'])(
    'returns no match for %j',
    tag => {
      expect(normalizeLocale(tag)).toBeNull()
    }
  )

  it('returns no match for non-strings', () => {
    expect(normalizeLocale(null)).toBeNull()
    expect(normalizeLocale(undefined)).toBeNull()
  })
})

describe('resolveLocale', () => {
  it('picks the first supported candidate in order', () => {
    expect(resolveLocale(['ja-JP', 'zh-Hant-TW', 'en-US'])).toBe('zh-TW')
    expect(resolveLocale(['en-US', 'zh-TW'])).toBe('en')
  })

  it('does not fall back to English on a single unsupported candidate', () => {
    expect(resolveLocale(['zh', 'fr', 'zh-CN'])).toBe('zh-CN')
  })

  it('falls back to English when nothing matches', () => {
    expect(resolveLocale([])).toBe('en')
    expect(resolveLocale(['zh', 'ja', null, undefined])).toBe('en')
  })
})

describe('localeFromSearchParams', () => {
  it('reads a valid lang value', () => {
    expect(localeFromSearchParams(new URLSearchParams('lang=zh-TW'))).toBe('zh-TW')
    expect(localeFromSearchParams(new URLSearchParams('lang=zh-hans'))).toBe('zh-CN')
  })

  it('only reads the first lang parameter', () => {
    expect(localeFromSearchParams(new URLSearchParams('lang=zh-CN&lang=en'))).toBe('zh-CN')
    expect(localeFromSearchParams(new URLSearchParams('lang=xx&lang=zh-TW'))).toBeNull()
  })

  it('returns null without a valid lang', () => {
    expect(localeFromSearchParams(new URLSearchParams(''))).toBeNull()
    expect(localeFromSearchParams(new URLSearchParams('lang='))).toBeNull()
    expect(localeFromSearchParams(new URLSearchParams('lang=<script>'))).toBeNull()
  })
})
