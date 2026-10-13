<script lang="ts">
  import { getI18n } from '$lib/i18n/context'

  import { EAPMethod, EncryptionMode, Layout } from './WifiCard.svelte'

  const { t } = getI18n()

  export let encryptionMode: EncryptionMode = EncryptionMode.WPA
  export let hiddenSSID: boolean = false
  export let hidePassword: boolean = false
  export let layout: Layout = Layout.Landscape
  export let eapMethod: EAPMethod = EAPMethod.PWD
</script>

<div class="flex w-full flex-col gap-4 py-4 sm:flex-row sm:gap-0">
  <div class="min-w-0 border-blue-400 sm:basis-6/12 sm:border-r sm:pr-2">
    <div class="flex flex-col">
      <p class="mb-2 font-semibold">{$t('settings.layout')}</p>
      <div class="flex flex-col">
        <label class="mb-2 ml-2">
          <input type="radio" name="layout" value="Landscape" bind:group={layout} />
          {$t('settings.landscape')}
        </label>
        <label class="mb-2 ml-2">
          <input type="radio" name="layout" value="Portrait" bind:group={layout} />
          {$t('settings.portrait')}
        </label>
      </div>
      <label class="mb-2">
        <input type="checkbox" bind:checked={hidePassword} />
        {$t('settings.hidePassword')}
      </label>
      <label class="mb-2">
        <input type="checkbox" bind:checked={hiddenSSID} />
        {$t('settings.hiddenSsid')}
      </label>
    </div>
  </div>
  <div
    class="min-w-0 border-t border-blue-400 pt-4 sm:basis-6/12 sm:border-l sm:border-t-0 sm:pl-2 sm:pt-0"
  >
    <p class="mb-2 font-semibold">{$t('settings.encryption')}</p>
    <div class="flex flex-col">
      <label class="mb-2 ml-2">
        <input
          type="radio"
          name="encryption"
          value={EncryptionMode.NOPASS}
          bind:group={encryptionMode}
        />
        {$t('settings.none')}
      </label>
      <label class="mb-2 ml-2">
        <input
          type="radio"
          name="encryption"
          value={EncryptionMode.WPA}
          bind:group={encryptionMode}
        />
        WPA/WPA2/WPA3
      </label>
      <label class="mb-2 ml-2">
        <input
          type="radio"
          name="encryption"
          value={EncryptionMode.WPA2EAP}
          bind:group={encryptionMode}
        />
        WPA2-EAP
      </label>
      <label class="mb-2 ml-2">
        <input
          type="radio"
          name="encryption"
          value={EncryptionMode.WEP}
          bind:group={encryptionMode}
        /> WEP
      </label>
    </div>
    {#if encryptionMode === EncryptionMode.WPA2EAP}
      <p class="mb-2 font-semibold">{$t('settings.eapMethod')}</p>
      <div class="flex flex-col">
        <label class="mb-2 ml-2">
          <input type="radio" name="eap" value={EAPMethod.PWD} bind:group={eapMethod} /> PWD
        </label>
      </div>
    {/if}
  </div>
</div>
