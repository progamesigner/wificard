import { DEFAULT_LOCALE, localeFromSearchParams } from '$lib/i18n/locales'

import type { LayoutLoad } from './$types'

// Only the URL decides the server-rendered locale; browser preferences are applied after mount.
export const load: LayoutLoad = ({ url }) => ({
  locale: localeFromSearchParams(url.searchParams) ?? DEFAULT_LOCALE,
})
