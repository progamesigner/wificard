<script lang="ts">
  import type { EAPMethod, EncryptionMode, Layout } from './WifiCard.svelte'

  export let encryptionMode: EncryptionMode = 'WPA'
  export let hiddenSSID: boolean = false
  export let hidePassword: boolean = false
  export let layout: Layout = 'Landscape'
  export let eapMethod: EAPMethod = 'PWD'
</script>

<div class="flex w-full py-4">
  <div class="basis-6/12 border-r border-blue-400 pr-2">
    <div class="flex flex-col">
      <p class="mb-2">Layout</p>
      <div class="flex flex-col">
        <label class="mb-2 ml-2">
          <input type="radio" name="layout" value="Landscape" bind:group={layout} /> Landscape
        </label>
        <label class="mb-2 ml-2">
          <input type="radio" name="layout" value="Portrait" bind:group={layout} /> Portrait
        </label>
      </div>
      <label class="mb-2">
        <input type="checkbox" bind:checked={hidePassword} /> Hide Password
      </label>
      <label class="mb-2">
        <input type="checkbox" bind:checked={hiddenSSID} /> Hidden SSID
      </label>
    </div>
  </div>
  <div class="basis-6/12 border-l border-blue-400 pl-2">
    <p class="mb-2">Encryption</p>
    <div class="flex flex-col">
      <label class="mb-2 ml-2">
        <input type="radio" name="encryption" value="nopass" bind:group={encryptionMode} /> None
      </label>
      <label class="mb-2 ml-2">
        <input type="radio" name="encryption" value="WPA" bind:group={encryptionMode} />
        WPA/WPA2/WPA3
      </label>
      <label class="mb-2 ml-2">
        <input type="radio" name="encryption" value="WPA2-EAP" bind:group={encryptionMode} />
        WPA2-EAP
      </label>
      <label class="mb-2 ml-2">
        <input type="radio" name="encryption" value="WEP" bind:group={encryptionMode} /> WEP
      </label>
    </div>
    {#if encryptionMode === 'WPA2-EAP'}
      <p class="mb-2">EAP Method</p>
      <div class="flex flex-col">
        <label class="mb-2 ml-2">
          <input type="radio" name="eap" value="PWD" bind:group={eapMethod} /> PWD
        </label>
      </div>
    {/if}
  </div>
</div>
