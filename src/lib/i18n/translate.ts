import { DEFAULT_LOCALE, type Locale } from './locales'
import en, { type Messages } from './messages/en'
import zhCN from './messages/zh-CN'
import zhTW from './messages/zh-TW'

export type MessageKey = keyof Messages

type MessageParams<K extends MessageKey> = Messages[K] extends (params: infer P) => string
  ? P
  : never

/** Static keys take no argument; parameterized keys require their typed parameter object. */
export type MessageArgs<K extends MessageKey> = Messages[K] extends string
  ? []
  : [params: MessageParams<K>]

export type Translator = <K extends MessageKey>(key: K, ...args: MessageArgs<K>) => string

type Message = string | ((params: never) => string)

export const dictionaries: Readonly<Record<Locale, Readonly<Messages>>> = Object.freeze({
  en: Object.freeze(en),
  'zh-TW': Object.freeze(zhTW),
  'zh-CN': Object.freeze(zhCN),
})

type DictionarySet = Readonly<Record<Locale, Readonly<Partial<Record<string, Message>>>>>

function lookup(source: DictionarySet, locale: Locale, key: string): Message | undefined {
  const dictionary = source[locale]
  return Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : undefined
}

function render(message: Message, args: ReadonlyArray<unknown>): string {
  return typeof message === 'function' ? (message as (params: unknown) => string)(args[0]) : message
}

/**
 * Looks a message up in `source`. Missing translations fall back to the English message for the
 * same key; an unknown key renders the key itself instead of throwing. Only the key is logged,
 * never interpolated values. Exported for tests; app code uses `translate`.
 */
export function translateFrom(
  source: DictionarySet,
  locale: Locale,
  key: string,
  args: ReadonlyArray<unknown> = []
): string {
  const message = lookup(source, locale, key)
  if (message !== undefined) {
    return render(message, args)
  }

  if (import.meta.env?.DEV) {
    console.warn(`[i18n] Missing "${locale}" message: ${key}`)
  }

  const fallback = lookup(source, DEFAULT_LOCALE, key)
  return fallback === undefined ? key : render(fallback, args)
}

/** Pure, typed translation: the locale is always passed in, never read from global state. */
export function translate<K extends MessageKey>(
  locale: Locale,
  key: K,
  ...args: MessageArgs<K>
): string {
  return translateFrom(dictionaries, locale, key, args)
}

export function createTranslator(locale: Locale): Translator {
  return (key, ...args) => translate(locale, key, ...args)
}
