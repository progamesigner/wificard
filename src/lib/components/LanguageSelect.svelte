<script lang="ts">
  import { replaceState } from '$app/navigation'
  import { page } from '$app/stores'
  import { safeLocalStorage, urlWithLocale, writeStoredLocale } from '$lib/i18n/browser'
  import { getI18n } from '$lib/i18n/context'
  import { isLocale, type Locale } from '$lib/i18n/locales'

  // Each language is always shown by its own name, in its own language.
  const options: ReadonlyArray<{ value: Locale; label: string }> = [
    { value: 'en', label: 'English' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'zh-CN', label: '简体中文' },
  ]

  const { locale, setLocale, t } = getI18n()

  function handleChange(event: Event): void {
    const value = (event.currentTarget as HTMLSelectElement).value
    if (!isLocale(value)) {
      return
    }

    setLocale(value)
    writeStoredLocale(safeLocalStorage, value)

    // Keep the page state, path, other query parameters and hash; replace without reloading so
    // unsaved form input survives and no history entry is added per switch.
    try {
      replaceState(urlWithLocale(new URL(window.location.href), value), $page.state)
    } catch {
      // The switch already applied; a failed URL update must not break the page.
    }
  }
</script>

<label class="flex items-center gap-2 print:hidden">
  <span class="font-medium">{$t('language.label')}</span>
  <select
    class="min-h-[44px] rounded-md border border-slate-300 bg-white px-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    value={$locale}
    on:change={handleChange}
  >
    {#each options as option (option.value)}
      <option value={option.value} lang={option.value}>{option.label}</option>
    {/each}
  </select>
</label>
