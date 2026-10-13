import { describe, expect, it, vi } from 'vitest'

import { LOCALES, type Locale } from './locales'
import en from './messages/en'
import { createTranslator, dictionaries, translate, translateFrom } from './translate'

describe('translate', () => {
  it('returns static messages for each locale', () => {
    expect(translate('en', 'actions.print')).toBe('Print')
    expect(translate('zh-TW', 'actions.print')).toBe('列印')
    expect(translate('zh-CN', 'actions.print')).toBe('打印')
  })

  it('renders parameterized messages', () => {
    expect(translate('en', 'validation.passwordMin', { min: 8 })).toContain('at least 8 characters')
    expect(translate('zh-TW', 'validation.passwordMin', { min: 5 })).toContain('5 個字元')
    expect(translate('zh-CN', 'validation.passwordMin', { min: 5 })).toContain('5 个字符')
  })

  it('creates a translator bound to one locale', () => {
    expect(createTranslator('zh-TW')('settings.layout')).toBe('版面')
  })

  it('falls back to English for a missing translation without logging values', () => {
    const partial = { ...dictionaries['zh-TW'] } as Partial<typeof en>
    delete partial['app.credit']
    const source = { ...dictionaries, 'zh-TW': partial }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    try {
      expect(translateFrom(source, 'zh-TW', 'app.credit', [{ author: 'secret-value' }])).toBe(
        'Made by secret-value'
      )
      expect(translateFrom(source, 'zh-TW', 'actions.print')).toBe('列印')
      expect(warn).toHaveBeenCalledTimes(1)
      expect(String(warn.mock.calls[0][0])).toContain('app.credit')
      expect(String(warn.mock.calls[0][0])).not.toContain('secret-value')
    } finally {
      warn.mockRestore()
    }
  })

  it('does not crash on an unknown key at runtime', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    try {
      expect(translate('en', 'missing.key' as 'actions.print')).toBe('missing.key')
    } finally {
      warn.mockRestore()
    }
  })

  it('rejects wrong keys and parameters at type level', () => {
    // These lines are checked by `npm run check`; they never run.
    const typeOnly = (): void => {
      // @ts-expect-error unknown key
      translate('en', 'card.unknown')
      // @ts-expect-error static message does not take parameters
      translate('en', 'actions.print', { min: 1 })
      // @ts-expect-error missing required parameters
      translate('en', 'validation.passwordMin')
      // @ts-expect-error wrong parameter type
      translate('en', 'validation.passwordMin', { min: '8' })
      // @ts-expect-error wrong parameter name
      translate('en', 'app.credit', { name: 'x' })
      // @ts-expect-error unsupported locale
      translate('ja', 'actions.print')
    }
    expect(typeof typeOnly).toBe('function')
  })
})

describe('dictionaries', () => {
  const sourceKeys = Object.keys(en).sort()

  it.each(LOCALES)('%s has exactly the source keys', locale => {
    expect(Object.keys(dictionaries[locale]).sort()).toEqual(sourceKeys)
  })

  it.each(LOCALES)('%s has non-empty messages of the same kind and arity', locale => {
    const dictionary = dictionaries[locale] as unknown as Record<string, unknown>
    const source = en as unknown as Record<string, unknown>

    for (const key of sourceKeys) {
      const message = dictionary[key]
      const sourceMessage = source[key]
      expect(typeof message, key).toBe(typeof sourceMessage)

      if (typeof message === 'string') {
        expect(message.trim(), key).not.toBe('')
      } else if (typeof message === 'function' && typeof sourceMessage === 'function') {
        expect(message.length, key).toBe(sourceMessage.length)
      }
    }
  })

  it.each(LOCALES)('%s interpolates every parameter', locale => {
    const t = createTranslator(locale as Locale)
    expect(t('validation.passwordMin', { min: 12345 })).toContain('12345')
    expect(t('app.credit', { author: 'AUTHOR' })).toContain('AUTHOR')
    expect(t('app.titleWithSsid', { ssid: 'SSID-X' })).toContain('SSID-X')
  })

  it('keeps Chinese dictionaries distinct', () => {
    expect(dictionaries['zh-TW']['card.scanHint']).not.toBe(dictionaries['zh-CN']['card.scanHint'])
    expect(dictionaries['zh-TW']['settings.portrait']).toBe('直向')
    expect(dictionaries['zh-CN']['settings.portrait']).toBe('纵向')
  })
})
