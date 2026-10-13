import { describe, expect, it } from 'vitest'

import {
  STORAGE_KEY,
  browserLanguages,
  detectLocale,
  readStoredLocale,
  urlWithLocale,
  writeStoredLocale,
} from './browser'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

const throwingStorage = {
  getItem(): string | null {
    throw new Error('blocked')
  },
  setItem(): void {
    throw new Error('quota')
  },
}

describe('stored locale', () => {
  it('reads only canonical values', () => {
    expect(readStoredLocale(() => memoryStorage({ [STORAGE_KEY]: 'zh-CN' }))).toBe('zh-CN')
    expect(readStoredLocale(() => memoryStorage({ [STORAGE_KEY]: 'zh-cn' }))).toBeNull()
    expect(readStoredLocale(() => memoryStorage({ [STORAGE_KEY]: 'ja' }))).toBeNull()
    expect(readStoredLocale(() => memoryStorage())).toBeNull()
    expect(readStoredLocale(() => null)).toBeNull()
  })

  it('survives storage that throws', () => {
    expect(readStoredLocale(() => throwingStorage)).toBeNull()
    expect(writeStoredLocale(() => throwingStorage, 'en')).toBe(false)
    expect(
      readStoredLocale(() => {
        throw new Error('SecurityError')
      })
    ).toBeNull()
  })

  it('writes only the locale value under the versioned key', () => {
    const storage = memoryStorage()
    expect(writeStoredLocale(() => storage, 'zh-TW')).toBe(true)
    expect([...storage.data.entries()]).toEqual([[STORAGE_KEY, 'zh-TW']])
  })
})

describe('browserLanguages', () => {
  it('prefers navigator.languages and falls back to navigator.language', () => {
    expect(browserLanguages({ languages: ['ja', 'zh-TW'], language: 'ja' })).toEqual([
      'ja',
      'zh-TW',
    ])
    expect(browserLanguages({ languages: [], language: 'zh-CN' })).toEqual(['zh-CN'])
    expect(browserLanguages({})).toEqual([])
    expect(browserLanguages(undefined)).toEqual([])
  })
})

describe('detectLocale', () => {
  const url = (search: string) => new URL(`https://example.test/${search}`)

  it('uses URL, then storage, then browser, then English', () => {
    expect(
      detectLocale({ url: url('?lang=zh-CN'), storedLocale: 'en', languages: ['zh-TW'] })
    ).toBe('zh-CN')
    expect(detectLocale({ url: url(''), storedLocale: 'en', languages: ['zh-TW'] })).toBe('en')
    expect(detectLocale({ url: url(''), storedLocale: null, languages: ['zh-TW'] })).toBe('zh-TW')
    expect(detectLocale({ url: url(''), storedLocale: null, languages: ['ja', 'zh'] })).toBe('en')
  })

  it('ignores an invalid URL value and continues', () => {
    expect(detectLocale({ url: url('?lang=xx'), storedLocale: 'zh-TW', languages: [] })).toBe(
      'zh-TW'
    )
  })
})

describe('urlWithLocale', () => {
  it('merges every lang into one canonical value and keeps the rest', () => {
    const next = urlWithLocale(
      new URL('https://example.test/path?lang=zh&a=1&lang=fr&b=2#section'),
      'en'
    )
    expect(next.pathname).toBe('/path')
    expect(next.hash).toBe('#section')
    expect(next.searchParams.getAll('lang')).toEqual(['en'])
    expect(next.searchParams.get('a')).toBe('1')
    expect(next.searchParams.get('b')).toBe('2')
  })

  it('does not mutate the input URL', () => {
    const input = new URL('https://example.test/?lang=en')
    urlWithLocale(input, 'zh-TW')
    expect(input.search).toBe('?lang=en')
  })
})
