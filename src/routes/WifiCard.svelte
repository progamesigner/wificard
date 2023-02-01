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
  import { escape } from 'svelte/internal'

  import { default as QRCode } from './QRCode.svelte'
  import { default as QRCodeIcon } from './QRCodeIcon.svelte'
  import { default as WifiIcon } from './WifiIcon.svelte'

  export let eapMethod: EAPMethod = EAPMethod.PWD
  export let encryptionMode: EncryptionMode = EncryptionMode.NOPASS
  export let hiddenSSID: boolean = false
  export let hidePassword: boolean = false
  export let layout: Layout = Layout.Landscape

  let margin: number = 0
  let ssid: string = ''
  let password: string = ''
  let eapIdentity: string = ''

  $: options = makeOptions(encryptionMode, ssid, password, hiddenSSID, eapMethod, eapIdentity)
  $: data = Object.entries(options).reduce((data, [key, value]) => `${data}${key}:${value};`, '')

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

    if (encryptionMode === 'WPA2-EAP') {
      options.E = eapMethod
      options.I = eapIdentity
    }

    if (password === '' && encryptionMode !== EncryptionMode.NOPASS) {
      options.T = EncryptionMode.NOPASS
    }

    return options
  }
</script>

<div class="flex flex-col p-4 shadow-md transition-all hover:shadow-lg">
  <div class="flex items-center font-bold">
    <span class="mr-2 h-8 w-8">
      <WifiIcon />
    </span>
    <span>Wi-Fi Login</span>
  </div>

  <div class="flex flex-row items-center">
    <div class="basis-7/12 p-4">
      <QRCode data={`WIFI:${data};`} {margin} />
    </div>

    <div class="flex basis-full flex-col justify-center p-4">
      <div>
        <label>
          <span class="mb-2">Network</span>
          <input
            class="mb-2 h-12 w-full rounded border px-4 font-bold outline-1 outline-blue-400 transition-all focus:outline print:border-transparent"
            placeholder="Wifi Network Name ..."
            type="text"
            bind:value={ssid}
          />
        </label>
      </div>

      {#if encryptionMode === 'WPA2-EAP'}
        <div>
          <label>
            <span class="mb-2">EAP Method</span>
            <input
              class="mb-2 h-12 w-full cursor-not-allowed rounded border px-4 font-bold outline-1 outline-blue-400 transition-all focus:outline print:border-transparent"
              placeholder="WPA2-EAP Method ..."
              type="text"
              disabled
              readonly
              bind:value={eapMethod}
            />
          </label>
        </div>
        <div>
          <label>
            <span class="mb-2">EAP Identity</span>
            <input
              class="mb-2 h-12 w-full rounded border px-4 font-bold outline-1 outline-blue-400 transition-all focus:outline print:border-transparent"
              type="text"
              placeholder="Username ..."
              bind:value={eapIdentity}
            />
          </label>
        </div>
      {/if}

      {#if !hidePassword && encryptionMode !== 'nopass'}
        <div>
          <label>
            <span class="mb-2">Password</span>
            <input
              class="mb-2 h-12 w-full rounded border px-4 font-bold outline-1 outline-blue-400 transition-all focus:outline print:border-transparent"
              type="text"
              placeholder="Password ..."
              bind:value={password}
            />
          </label>
        </div>
      {/if}
    </div>
  </div>

  <div class="border-t pt-2">
    <div class="flex items-center">
      <span class="h-6 w-6 fill-none stroke-current stroke-2">
        <QRCodeIcon />
      </span>
      <span>Scan the QRCode to connect</span>
    </div>
  </div>
</div>
