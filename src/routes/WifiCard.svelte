<script context="module" lang="ts">
  export const enum EAPMethod {
    PWD = 'PWD',
    TTLS = 'TTLS',
  }

  export const enum EncryptionMode {
    NOPASS = 'nopass',
    WEP = 'WEP',
    WPA = 'WPA',
    WPA2EAP = 'WPA2-EAP',
  }

  export const enum Layout {
    Landscape = 'Landscape',
    Portrait = 'Portrait',
  }

  export const enum Hidden {
    Yes = 'true',
    No = 'false',
  }

  export interface Errors {
    S?: string
    P?: string
    I?: string
  }

  export interface Options {
    T?: EncryptionMode
    S?: string
    P?: string
    H?: Hidden
    E?: EAPMethod
    I?: string
  }
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { getI18n } from '$lib/i18n/context'

  import { default as ExclamationIcon } from './ExclamationIcon.svelte'
  import { default as QRCode } from './QRCode.svelte'
  import { default as QRCodeIcon } from './QRCodeIcon.svelte'
  import { default as WifiIcon } from './WifiIcon.svelte'

  const dispatch = createEventDispatcher()
  const { t } = getI18n()

  export let eapIdentity: string = ''
  export let eapIdentityError: string = ''
  export let eapMethod: EAPMethod = EAPMethod.PWD
  export let encryptionMode: EncryptionMode = EncryptionMode.NOPASS
  export let hiddenSSID: boolean = false
  export let hidePassword: boolean = false
  export let layout: Layout = Layout.Landscape
  export let password: string = ''
  export let passwordError: string = ''
  export let ssid: string = ''
  export let ssidError: string = ''

  // Card title stays in page memory; an empty value shows the current language's placeholder.
  let customTitle: string = ''
  let margin: number = 0

  $: options = makeOptions(encryptionMode, ssid, password, hiddenSSID, eapMethod, eapIdentity)
  $: data = Object.entries(options).reduce((data, [key, value]) => `${data}${key}:${value};`, '')
  $: errors = makeErrors(ssidError, passwordError, eapIdentityError)

  function handleEAPIdentityChanged(): void {
    dispatch('eapIdentityChanged')
  }

  function handlePasswordChanged(): void {
    dispatch('passwordChanged')
  }

  function handleSSIDChanged(): void {
    dispatch('ssidChanged')
  }

  function makeErrors(ssid: string, password: string, eapIdentity: string): Errors {
    const errors = {} as Errors

    if (ssid.length > 0) {
      errors.S = ssid
    }

    if (password.length > 0) {
      errors.P = password
    }

    if (eapIdentity.length > 0) {
      errors.I = eapIdentity
    }

    return errors
  }

  function makeOptions(
    encryptionMode: EncryptionMode,
    ssid: string,
    password: string,
    hiddenSSID: boolean,
    eapMethod: EAPMethod,
    eapIdentity: string
  ): Options {
    const options = {
      T: encryptionMode,
      S: escapeWiFiValue(ssid),
      P: escapeWiFiValue(password),
      H: hiddenSSID ? Hidden.Yes : Hidden.No,
    } as Options

    if (encryptionMode === EncryptionMode.NOPASS) {
      options.P = ''
    }

    if (encryptionMode === EncryptionMode.WPA2EAP) {
      options.E = eapMethod
      options.I = eapIdentity
    }

    if (password === '' && encryptionMode !== EncryptionMode.NOPASS) {
      options.T = EncryptionMode.NOPASS
    }

    return options
  }

  function escapeWiFiValue(value: string): string {
    return value.replace(/[\\;,:"]/g, '\\$&')
  }
</script>

<div
  class="mx-auto flex flex-col p-4 shadow-md hover:shadow-lg print:mx-0 print:border-4 print:border-dashed print:border-slate-100 print:shadow-none"
  class:max-w-xs={layout === Layout.Portrait}
>
  <div class="flex items-center font-bold">
    <span class="h-8 w-8 flex-shrink-0">
      <WifiIcon />
    </span>
    <label class="min-w-0 flex-1">
      <span class="sr-only">{$t('card.title.label')}</span>
      <input
        class="inline-block h-8 w-full rounded border border-none bg-slate-100 px-2 font-bold outline-2 outline-transparent transition-all focus:outline focus:outline-blue-400 print:bg-transparent"
        placeholder={$t('card.title.placeholder')}
        type="text"
        bind:value={customTitle}
      />
    </label>
  </div>

  <div
    class="flex items-center justify-center"
    class:flex-col={layout === Layout.Portrait}
    class:flex-row={layout === Layout.Landscape}
  >
    <div class="w-full basis-5/12 p-4" class:px-8={layout === Layout.Portrait}>
      <QRCode data={`WIFI:${data};`} label={$t('card.qrLabel')} {margin} />
    </div>

    <div class="flex min-w-0 basis-7/12 flex-col justify-center p-4">
      <div class="mb-2">
        <label>
          <span class="mb-2 font-medium">{$t('card.network.label')}</span>
          <input
            class="h-12 w-full rounded border bg-slate-100 px-4 font-bold outline-2 outline-blue-400 transition-all focus:outline print:border-transparent print:bg-transparent"
            class:border-red-400={!!errors.S}
            aria-invalid={!!errors.S}
            aria-describedby={errors.S ? 'ssid-error' : undefined}
            placeholder={$t('card.network.placeholder')}
            type="text"
            bind:value={ssid}
            on:input={handleSSIDChanged}
          />
        </label>
        {#if !!errors.S}
          <p id="ssid-error" class="flex items-center text-sm text-red-400">
            <span class="h-3 w-3 flex-shrink-0 fill-none stroke-current stroke-2">
              <ExclamationIcon />
            </span>
            <span class="min-w-0 break-words px-2">{errors.S}</span>
          </p>
        {/if}
      </div>

      {#if encryptionMode === EncryptionMode.WPA2EAP}
        <div class="mb-2">
          <label>
            <span class="mb-2 font-medium">{$t('card.eapMethod.label')}</span>
            <input
              class="h-12 w-full cursor-not-allowed rounded border bg-slate-100 px-4 font-bold outline-2 outline-blue-400 transition-all focus:outline print:border-transparent print:bg-transparent"
              placeholder={$t('card.eapMethod.placeholder')}
              type="text"
              disabled
              readonly
              bind:value={eapMethod}
            />
          </label>
        </div>
        <div class="mb-2">
          <label>
            <span class="mb-2 font-medium">{$t('card.identity.label')}</span>
            <input
              class="h-12 w-full rounded border bg-slate-100 px-4 font-bold outline-2 outline-blue-400 transition-all focus:outline print:border-transparent print:bg-transparent"
              class:border-red-400={!!errors.I}
              type="text"
              aria-invalid={!!errors.I}
              aria-describedby={errors.I ? 'identity-error' : undefined}
              placeholder={$t('card.identity.placeholder')}
              bind:value={eapIdentity}
              on:input={handleEAPIdentityChanged}
            />
          </label>
          {#if !!errors.I}
            <p id="identity-error" class="flex items-center text-sm text-red-400">
              <span class="h-3 w-3 flex-shrink-0 fill-none stroke-current stroke-2">
                <ExclamationIcon />
              </span>
              <span class="min-w-0 break-words px-2">{errors.I}</span>
            </p>
          {/if}
        </div>
      {/if}

      {#if !hidePassword && encryptionMode !== EncryptionMode.NOPASS}
        <div class="mb-2">
          <label>
            <span class="mb-2 font-medium">{$t('card.password.label')}</span>
            <input
              class="h-12 w-full rounded border bg-slate-100 px-4 font-bold outline-2 outline-blue-400 transition-all focus:outline print:border-transparent print:bg-transparent"
              class:border-red-400={!!errors.P}
              type="text"
              aria-invalid={!!errors.P}
              aria-describedby={errors.P ? 'password-error' : undefined}
              placeholder={$t('card.password.placeholder')}
              bind:value={password}
              on:input={handlePasswordChanged}
            />
          </label>
          {#if !!errors.P}
            <p id="password-error" class="flex items-center text-sm text-red-400">
              <span class="h-3 w-3 flex-shrink-0 fill-none stroke-current stroke-2">
                <ExclamationIcon />
              </span>
              <span class="min-w-0 break-words px-2">{errors.P}</span>
            </p>
          {/if}
        </div>
      {:else if hidePassword && !!errors.P}
        <div class="mb-2">
          <p class="flex items-center text-sm text-red-400">
            <span class="h-3 w-3 flex-shrink-0 fill-none stroke-current stroke-2">
              <ExclamationIcon />
            </span>
            <span class="min-w-0 break-words px-2">{errors.P}</span>
          </p>
        </div>
      {/if}
    </div>
  </div>

  <div class="border-t pt-2">
    <div class="flex items-center">
      <span class="h-6 w-6 fill-none stroke-current stroke-2">
        <QRCodeIcon />
      </span>
      <span class="ml-1 min-w-0 break-words">{$t('card.scanHint')}</span>
    </div>
  </div>
</div>
