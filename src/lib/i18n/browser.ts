import { LOCALE_QUERY_PARAM, isLocale, localeFromSearchParams, resolveLocale } from './locales'
import type { Locale } from './locales'

export const STORAGE_KEY = 'wificard.locale.v1'

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

interface NavigatorLike {
  languages?: ReadonlyArray<string>
  language?: string
}

/** Returns the saved manual preference, ignoring unknown values and storage access errors. */
export function readStoredLocale(getStorage: () => StorageLike | null | undefined): Locale | null {
  try {
    const value = getStorage()?.getItem(STORAGE_KEY)
    return isLocale(value) ? value : null
  } catch {
    return null
  }
}

/** Saves a manual preference. Returns false instead of throwing when storage is unavailable. */
export function writeStoredLocale(
  getStorage: () => StorageLike | null | undefined,
  locale: Locale
): boolean {
  try {
    const storage = getStorage()
    if (!storage) {
      return false
    }
    storage.setItem(STORAGE_KEY, locale)
    return true
  } catch {
    return false
  }
}

export function browserLanguages(navigator: NavigatorLike | null | undefined): Array<string> {
  if (!navigator) {
    return []
  }
  if (navigator.languages && navigator.languages.length > 0) {
    return [...navigator.languages]
  }
  return navigator.language ? [navigator.language] : []
}

/** Resolution order: valid URL `lang` → saved manual preference → browser languages → English. */
export function detectLocale(options: {
  url: URL
  storedLocale: Locale | null
  languages: ReadonlyArray<string>
}): Locale {
  return resolveLocale([
    localeFromSearchParams(options.url.searchParams),
    options.storedLocale,
    ...options.languages,
  ])
}

/** Returns a copy of `url` with every `lang` parameter merged into one canonical value. */
export function urlWithLocale(url: URL, locale: Locale): URL {
  const next = new URL(url)
  next.searchParams.delete(LOCALE_QUERY_PARAM)
  next.searchParams.set(LOCALE_QUERY_PARAM, locale)
  return next
}

export function safeLocalStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}
