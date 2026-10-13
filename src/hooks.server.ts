import type { Handle } from '@sveltejs/kit'

import { DEFAULT_LOCALE, localeFromSearchParams } from '$lib/i18n/locales'

export const handle: Handle = async ({ event, resolve }) => {
  // Only a whitelisted locale reaches the HTML; the raw query value is never inserted.
  const locale = localeFromSearchParams(event.url.searchParams) ?? DEFAULT_LOCALE

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%wificard.lang%', locale),
  })
}
