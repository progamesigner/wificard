<script lang="ts">
  import { tick } from 'svelte'

  import { default as LanguageSelect } from '$lib/components/LanguageSelect.svelte'
  import { getI18n } from '$lib/i18n/context'
  import type { Translator } from '$lib/i18n/translate'

  import { default as Setting } from './Setting.svelte'
  import { default as WifiCard, Layout, EAPMethod, EncryptionMode } from './WifiCard.svelte'
  import { default as WifiIcon } from './WifiIcon.svelte'

  // Errors are stored as message keys and parameters, so a visible error follows the language.
  type ValidationError =
    | {
        key:
          | 'validation.networkRequired'
          | 'validation.identityRequired'
          | 'validation.passwordRequired'
      }
    | { key: 'validation.passwordMin'; min: number }

  const { t } = getI18n()

  let eapIdentity: string = ''
  let eapIdentityError: ValidationError | null = null
  let eapMethod: EAPMethod = EAPMethod.PWD
  let encryptionMode: EncryptionMode = EncryptionMode.WPA
  let hiddenSSID: boolean = false
  let hidePassword: boolean = false
  let layout: Layout = Layout.Landscape
  let password: string = ''
  let passwordError: ValidationError | null = null
  let ssid: string = ''
  let ssidError: ValidationError | null = null

  function describe(t: Translator, error: ValidationError | null): string {
    if (error === null) {
      return ''
    }
    return error.key === 'validation.passwordMin' ? t(error.key, { min: error.min }) : t(error.key)
  }

  async function print(): Promise<void> {
    eapIdentityError = null
    passwordError = null
    ssidError = null

    if (ssid.length === 0) {
      ssidError = { key: 'validation.networkRequired' }
    }
    if (encryptionMode === EncryptionMode.WEP && password.length < 5) {
      passwordError = { key: 'validation.passwordMin', min: 5 }
    }
    if (encryptionMode === EncryptionMode.WPA && password.length < 8) {
      passwordError = { key: 'validation.passwordMin', min: 8 }
    }
    if (encryptionMode === EncryptionMode.WPA2EAP) {
      if (eapIdentity.length === 0) {
        eapIdentityError = { key: 'validation.identityRequired' }
      }
      if (password.length === 0) {
        passwordError = { key: 'validation.passwordRequired' }
      }
    }

    const valid = ssidError === null && passwordError === null && eapIdentityError === null

    // Let the latest translations and error state reach the DOM before printing.
    await tick()

    if (valid) {
      window.print()
    }
  }
</script>

<svelte:head>
  {#key ssid}
    {#if ssid.length > 0}
      <title>{$t('app.titleWithSsid', { ssid })}</title>
    {:else}
      <title>Wi-Fi Card</title>
    {/if}
  {/key}
  <meta name="description" content={$t('app.description')} />
</svelte:head>

<header class="print:hidden">
  <div class="container mx-auto max-w-xl px-4 pt-4">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h1 class="flex items-center text-4xl leading-tight font-bold">
        <span class="mr-2 h-10 w-10 shrink-0">
          <WifiIcon />
        </span>
        <span>Wi-Fi Card</span>
      </h1>
      <LanguageSelect />
    </div>
    <p class="mb-2">{$t('app.description')}</p>
    <p class="mb-2">
      {$t('app.privacy')}
      <a class="text-blue-600" href="https://github.com/progamesigner/wificard"
        >{$t('app.sourceLink')}</a
      >
    </p>
  </div>
</header>

<noscript>
  <div class="container mx-auto mb-auto max-w-xl px-4">
    <p>
      {$t('app.noScript')}
      <a class="text-blue-600" href="https://github.com/progamesigner/wificard"
        >{$t('app.noScriptSource')}</a
      >
    </p>
  </div>
</noscript>

<div class="container mx-auto mb-auto max-w-xl px-4 print:px-0">
  <section class="mb-2 print:block">
    <WifiCard
      eapIdentityError={describe($t, eapIdentityError)}
      {eapMethod}
      {encryptionMode}
      {hiddenSSID}
      {hidePassword}
      {layout}
      passwordError={describe($t, passwordError)}
      ssidError={describe($t, ssidError)}
      bind:eapIdentity
      bind:password
      bind:ssid
      on:eapIdentityChanged={() => (eapIdentityError = null)}
      on:passwordChanged={() => (passwordError = null)}
      on:ssidChanged={() => (ssidError = null)}
    />
  </section>

  <div class="mb-2 print:hidden">
    <Setting bind:eapMethod bind:encryptionMode bind:hidePassword bind:hiddenSSID bind:layout />
  </div>

  <div class="mb-2 print:hidden">
    <div class="flex justify-end">
      <button
        class="inline-flex min-h-[44px] items-center justify-center rounded-md bg-blue-600 px-8 font-semibold text-white outline-blue-600 transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-blue-800 motion-reduce:transition-none"
        on:click={print}
      >
        <span>{$t('actions.print')}</span>
      </button>
    </div>
  </div>
</div>

<footer class="mt-auto print:hidden">
  <div class="container mx-auto max-w-xl px-4 py-8 text-center">
    <p>
      <a class="text-blue-600" href="https://progamesigner.com"
        >{$t('app.credit', { author: 'progamesigner' })}</a
      >
      <span class="text-red-600" aria-hidden="true">&hearts;</span>
    </p>
  </div>
</footer>
