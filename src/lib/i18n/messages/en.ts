/**
 * Source dictionary. Keys are stable, flat and semantic; other locales must provide exactly the
 * same keys with the same value kinds and parameter types (checked with `satisfies Messages`).
 * Brand names, author names, URLs and Wi-Fi protocol values are never translated.
 */
const en = {
  'app.description':
    'Print a simple card with Wi-Fi details. Tape it to fridge, keep it in wallet, or display it in store, etc.',
  'app.privacy':
    'Your Wi-Fi information is never sent to the server. No tracking, analytics, or fingerprinting are used on this site.',
  'app.sourceLink': 'View the source code on GitHub.',
  'app.titleWithSsid': ({ ssid }: { ssid: string }): string => `Wi-Fi Card - ${ssid}`,
  'app.noScript': 'You need to enable JavaScript to run this app.',
  'app.noScriptSource': 'Feel free to view the source code.',
  'app.credit': ({ author }: { author: string }): string => `Made by ${author}`,

  'actions.print': 'Print',

  'language.label': 'Language',

  'validation.networkRequired': 'Network name is required',
  'validation.passwordMin': ({ min }: { min: number }): string =>
    `Password must be at least ${min} characters, or change the encryption mode to "None"`,
  'validation.identityRequired': 'Username is required',
  'validation.passwordRequired': 'Password is required',

  'card.title.label': 'Card title',
  'card.title.placeholder': 'Wi-Fi Login',
  'card.network.label': 'Network',
  'card.network.placeholder': 'Wi-Fi network name ...',
  'card.password.label': 'Password',
  'card.password.placeholder': 'Password ...',
  'card.eapMethod.label': 'EAP Method',
  'card.eapMethod.placeholder': 'WPA2-EAP Method ...',
  'card.identity.label': 'EAP Identity',
  'card.identity.placeholder': 'Username ...',
  'card.scanHint': 'Scan the QR code to connect',
  'card.qrLabel': 'Wi-Fi QR code',

  'settings.layout': 'Layout',
  'settings.landscape': 'Landscape',
  'settings.portrait': 'Portrait',
  'settings.hidePassword': 'Hide Password',
  'settings.hiddenSsid': 'Hidden SSID',
  'settings.encryption': 'Encryption',
  'settings.none': 'None',
  'settings.eapMethod': 'EAP Method',
}

export type Messages = typeof en

export default en
