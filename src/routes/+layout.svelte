<script lang="ts">
  import '../app.css'

  import { browser } from '$app/environment'
  import { afterNavigate } from '$app/navigation'
  import {
    browserLanguages,
    detectLocale,
    readStoredLocale,
    safeLocalStorage,
  } from '$lib/i18n/browser'
  import { createI18n, setI18n } from '$lib/i18n/context'

  import type { LayoutData } from './$types'

  export let data: LayoutData

  // One instance per component tree, so concurrent SSR requests never share a locale. Hydration
  // renders with the same URL-derived locale as the server before any browser preference applies.
  const i18n = setI18n(createI18n(data.locale))
  const { locale } = i18n

  // Runs after hydration and after each navigation (including back/forward), re-resolving the full
  // priority order. Shallow `replaceState` updates from the language menu do not trigger it.
  afterNavigate(({ to }) => {
    i18n.setLocale(
      detectLocale({
        url: to?.url ?? new URL(window.location.href),
        storedLocale: readStoredLocale(safeLocalStorage),
        languages: browserLanguages(window.navigator),
      })
    )
  })

  $: if (browser) {
    document.documentElement.lang = $locale
  }
</script>

<slot />
