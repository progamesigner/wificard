import { getContext, setContext } from 'svelte'
import { derived, writable, type Readable } from 'svelte/store'

import { isLocale, type Locale } from './locales'
import { createTranslator, type Translator } from './translate'

export interface I18n {
  locale: Readable<Locale>
  t: Readable<Translator>
  setLocale(locale: Locale): void
}

const CONTEXT_KEY = Symbol('i18n')

/**
 * Creates an isolated i18n instance. Call it once per component tree (the root layout), never at
 * module scope, so concurrent SSR requests cannot share the current locale.
 */
export function createI18n(initialLocale: Locale): I18n {
  const locale = writable<Locale>(initialLocale)
  const t = derived(locale, createTranslator)

  return {
    locale: { subscribe: locale.subscribe },
    t,
    setLocale(next) {
      if (isLocale(next)) {
        locale.set(next)
      }
    },
  }
}

export function setI18n(i18n: I18n): I18n {
  return setContext(CONTEXT_KEY, i18n)
}

export function getI18n(): I18n {
  const i18n = getContext<I18n | undefined>(CONTEXT_KEY)
  if (i18n === undefined) {
    throw new Error('i18n context is missing; create it in the root layout')
  }
  return i18n
}
