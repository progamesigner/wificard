<script lang="ts">
  import type { Layout, EAPMethod, EncryptionMode } from './WifiCard.svelte'

  import { default as Setting } from './Setting.svelte'
  import { default as WifiCard } from './WifiCard.svelte'
  import { default as WifiIcon } from './WifiIcon.svelte'

  let eapMethod: EAPMethod = 'PWD'
  let encryptionMode: EncryptionMode = 'WPA'
  let hiddenSSID: boolean = false
  let hidePassword: boolean = false
  let layout: Layout = 'Landscape'

  function print(): void {
    window.print()
  }
</script>

<header class="print:hidden">
  <div class="container mx-auto max-w-xl">
    <h1 class="mb-2 flex items-center text-4xl font-bold">
      <span class="mr-2 h-10 w-10">
        <WifiIcon />
      </span>
      <span>Wi-Fi Card</span>
    </h1>
    <div class="mb-2">Print a simple card with WiFi details.</div>
  </div>
</header>

<div class="container mb-auto mx-auto max-w-xl">
  <section class="mb-2 print:block">
    <WifiCard {eapMethod} {encryptionMode} {hiddenSSID} {hidePassword} />
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
    Made with<span class="text-red-500">&hearts;</span> By
    <a href="https://progamesigner.com">progamesigner</a>.
  </div>
</footer>
