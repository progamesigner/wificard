<script lang="ts">
  import { default as Setting } from './Setting.svelte'
  import { default as WifiCard, Layout, EAPMethod, EncryptionMode } from './WifiCard.svelte'
  import { default as WifiIcon } from './WifiIcon.svelte'

  let eapIdentity: string = ''
  let eapIdentityError: string = ''
  let eapMethod: EAPMethod = EAPMethod.PWD
  let encryptionMode: EncryptionMode = EncryptionMode.WPA
  let hiddenSSID: boolean = false
  let hidePassword: boolean = false
  let layout: Layout = Layout.Landscape
  let password: string = ''
  let passwordError: string = ''
  let ssid: string = ''
  let ssidError: string = ''

  function print(): void {
    eapIdentityError = ''
    passwordError = ''
    ssidError = ''

    if (ssid.length === 0) {
      ssidError = 'Network name is required'
    }
    if (encryptionMode === EncryptionMode.WEP && password.length < 5) {
      passwordError =
        'Password must be at least 5 characters, or change the encryption mode to "None"'
    }
    if (encryptionMode === EncryptionMode.WPA && password.length < 8) {
      passwordError =
        'Password must be at least 8 characters, or change the encryption mode to "None"'
    }
    if (encryptionMode === EncryptionMode.WPA2EAP) {
      if (eapIdentity.length === 0) {
        eapIdentityError = 'Username is required'
      }
      if (password.length === 0) {
        passwordError = 'Password is required'
      }
    }

    if (ssidError.length === 0 && passwordError.length === 0 && eapIdentityError.length === 0) {
      window.print()
    }
  }
</script>

<svelte:head>
  {#key ssid}
    {#if ssid.length > 0}
      <title>Wi-Fi Card - {ssid}</title>
    {:else}
      <title>Wi-Fi Card</title>
    {/if}
  {/key}
  <meta
    name="description"
    content="Print a simple card with Wi-Fi details. Tape it to fridge, keep it in wallet, or display it in store, etc."
  />
</svelte:head>

<header class="print:hidden">
  <div class="container mx-auto max-w-xl">
    <h1 class="mb-4 flex items-center text-4xl font-bold">
      <span class="mr-2 h-10 w-10">
        <WifiIcon />
      </span>
      <span>Wi-Fi Card</span>
    </h1>
    <div class="mb-2">
      Print a simple card with Wi-Fi details. Tape it to fridge, keep it in wallet, or display it in
      store, etc.
    </div>
    <div class="mb-2">
      Your Wi-Fi information is never sent to the server. No tracking, analytics, or fingerprinting
      are used on this site. View the <a
        class="text-blue-600"
        href="https://github.com/progamesigner/wificard">source code</a
      > on GitHub.
    </div>
  </div>
</header>

<noscript>
  <div class="container mx-auto mb-auto max-w-xl">
    <p>
      You need to enable JavaScript to run this app. Feel free to view the <a
        class="text-blue-600"
        href="https://github.com/progamesigner/wificard">source code</a
      >.
    </p>
  </div>
</noscript>

<div class="container mx-auto mb-auto max-w-xl">
  <section class="mb-2 print:block">
    <WifiCard
      {eapIdentityError}
      {eapMethod}
      {encryptionMode}
      {hiddenSSID}
      {hidePassword}
      {layout}
      {passwordError}
      {ssidError}
      bind:eapIdentity
      bind:password
      bind:ssid
      on:eapIdentityChanged={() => (eapIdentityError = '')}
      on:passwordChanged={() => (passwordError = '')}
      on:ssidChanged={() => (ssidError = '')}
    />
  </section>

  <div class="mb-2 print:hidden">
    <Setting bind:eapMethod bind:encryptionMode bind:hidePassword bind:hiddenSSID bind:layout />
  </div>

  <div class="mb-2 print:hidden">
    <div class="flex justify-end">
      <button
        class="rounded bg-blue-400 px-8 py-2 text-white transition-all hover:bg-blue-600"
        on:click={print}
      >
        <span>Print</span>
      </button>
    </div>
  </div>
</div>

<footer class="mt-auto print:hidden">
  <div class="container mx-auto max-w-xl py-8 text-center">
    <p>
      Made with <span class="text-red-600">&hearts;</span> by
      <a class="text-blue-600" href="https://progamesigner.com">progamesigner</a>.
    </p>
  </div>
</footer>
