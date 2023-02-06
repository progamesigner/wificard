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
  import { escape } from 'svelte/internal'

  import { default as ExclamationIcon } from './ExclamationIcon.svelte'
  import { default as QRCode } from './QRCode.svelte'
  import { default as QRCodeIcon } from './QRCodeIcon.svelte'
  import { default as WifiIcon } from './WifiIcon.svelte'

  const dispatch = createEventDispatcher()

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
      S: escape(ssid),
      P: escape(password),
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
</script>

<div
  class="mx-auto flex flex-col p-4 shadow-md hover:shadow-lg print:mx-0 print:border-4 print:border-dashed print:border-slate-100 print:shadow-none"
  class:max-w-xs={layout === Layout.Portrait}
>
  <div class="flex items-center font-bold">
    <span class="h-8 w-8">
      <WifiIcon />
    </span>
    <input
      class="inline-block h-8 w-full rounded border border-none bg-slate-100 px-2 font-bold outline-2 outline-transparent transition-all focus:outline focus:outline-blue-400 print:bg-transparent"
      placeholder="Wi-Fi Login"
      type="text"
    />
  </div>

  <div
    class="flex items-center justify-center"
    class:flex-col={layout === Layout.Portrait}
    class:flex-row={layout === Layout.Landscape}
  >
    <div class="w-full basis-5/12 p-4" class:px-8={layout === Layout.Portrait}>
      <QRCode data={`WIFI:${data};`} {margin} />
    </div>

    <div class="flex basis-7/12 flex-col justify-center p-4">
      <div class="mb-2">
        <label>
          <span class="mb-2">Network</span>
          <input
            class="h-12 w-full rounded border bg-slate-100 px-4 font-bold outline-2 outline-blue-400 transition-all focus:outline print:border-transparent print:bg-transparent"
            class:border-red-400={!!errors.S}
            placeholder="Wifi Network Name ..."
            type="text"
            bind:value={ssid}
            on:input={handleSSIDChanged}
          />
        </label>
        {#if !!errors.S}
          <p class="flex items-center text-sm text-red-400">
            <span class="h-3 w-3 flex-shrink-0 fill-none stroke-current stroke-2">
              <ExclamationIcon />
            </span>
            <span class="px-2">{errors.S}</span>
          </p>
        {/if}
      </div>

      {#if encryptionMode === EncryptionMode.WPA2EAP}
        <div class="mb-2">
          <label>
            <span class="mb-2">EAP Method</span>
            <input
              class="h-12 w-full cursor-not-allowed rounded border bg-slate-100 px-4 font-bold outline-2 outline-blue-400 transition-all focus:outline print:border-transparent print:bg-transparent"
              placeholder="WPA2-EAP Method ..."
              type="text"
              disabled
              readonly
              bind:value={eapMethod}
            />
          </label>
        </div>
        <div class="mb-2">
          <label>
            <span class="mb-2">EAP Identity</span>
            <input
              class="h-12 w-full rounded border bg-slate-100 px-4 font-bold outline-2 outline-blue-400 transition-all focus:outline print:border-transparent print:bg-transparent"
              class:border-red-400={!!errors.I}
              type="text"
              placeholder="Username ..."
              bind:value={eapIdentity}
              on:input={handleEAPIdentityChanged}
            />
          </label>
          {#if !!errors.I}
            <p class="flex items-center text-sm text-red-400">
              <span class="h-3 w-3 flex-shrink-0 fill-none stroke-current stroke-2">
                <ExclamationIcon />
              </span>
              <span class="px-2">{errors.I}</span>
            </p>
          {/if}
        </div>
      {/if}

      {#if !hidePassword && encryptionMode !== EncryptionMode.NOPASS}
        <div class="mb-2">
          <label>
            <span class="mb-2">Password</span>
            <input
              class="h-12 w-full rounded border bg-slate-100 px-4 font-bold outline-2 outline-blue-400 transition-all focus:outline print:border-transparent print:bg-transparent"
              class:border-red-400={!!errors.P}
              type="text"
              placeholder="Password ..."
              bind:value={password}
              on:input={handlePasswordChanged}
            />
          </label>
          {#if !!errors.P}
            <p class="flex items-center text-sm text-red-400">
              <span class="h-3 w-3 flex-shrink-0 fill-none stroke-current stroke-2">
                <ExclamationIcon />
              </span>
              <span class="px-2">{errors.P}</span>
            </p>
          {/if}
        </div>
      {:else if hidePassword && !!errors.P}
        <div class="mb-2">
          <p class="flex items-center text-sm text-red-400">
            <span class="h-3 w-3 flex-shrink-0 fill-none stroke-current stroke-2">
              <ExclamationIcon />
            </span>
            <span class="px-2">{errors.P}</span>
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
      <span class="ml-1">Scan the QRCode to connect</span>
    </div>
  </div>
</div>
