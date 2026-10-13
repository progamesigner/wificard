export const LOCALES = ['en', 'zh-TW', 'zh-CN'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_QUERY_PARAM = 'lang'

const TAG_PATTERN = /^[a-z]{2,3}(-[a-z0-9]{1,8})*$/

const TRADITIONAL_REGIONS = new Set(['tw', 'hk', 'mo'])
const SIMPLIFIED_REGIONS = new Set(['cn', 'sg'])

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as ReadonlyArray<string>).includes(value)
}

/**
 * Maps a BCP 47 language tag to a supported locale, or returns null when the tag is malformed or
 * unsupported. Chinese tags need an explicit script or a known region; bare `zh` never matches, so
 * callers can move on to the next candidate instead of guessing between Traditional and Simplified.
 */
export function normalizeLocale(tag: string | null | undefined): Locale | null {
  if (typeof tag !== 'string') {
    return null
  }

  const value = tag.trim().toLowerCase().replace(/_/g, '-')
  if (!TAG_PATTERN.test(value)) {
    return null
  }

  const [language, ...subtags] = value.split('-')

  if (language === 'en') {
    return 'en'
  }

  if (language !== 'zh') {
    return null
  }

  const script = /^[a-z]{4}$/.test(subtags[0] ?? '') ? subtags.shift() : undefined
  if (script === 'hant') {
    return 'zh-TW'
  }
  if (script === 'hans') {
    return 'zh-CN'
  }
  if (script !== undefined) {
    return null
  }

  const region = subtags[0]
  if (region !== undefined && TRADITIONAL_REGIONS.has(region)) {
    return 'zh-TW'
  }
  if (region !== undefined && SIMPLIFIED_REGIONS.has(region)) {
    return 'zh-CN'
  }

  return null
}

/** Returns the first candidate that matches a supported locale, falling back to English. */
export function resolveLocale(candidates: Iterable<string | null | undefined>): Locale {
  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate)
    if (locale !== null) {
      return locale
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Reads only the first `lang` query parameter. If that one is invalid, the URL has no valid
 * locale; later duplicates are ignored on purpose.
 */
export function localeFromSearchParams(params: URLSearchParams): Locale | null {
  return normalizeLocale(params.get(LOCALE_QUERY_PARAM))
}
