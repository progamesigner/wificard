import type { Messages } from './en'

const zhTW = {
  'app.description':
    '列印一張寫著 Wi-Fi 資訊的簡易卡片，可以貼在冰箱上、放進皮夾，或擺在店裡展示。',
  'app.privacy': '你的 Wi-Fi 資訊絕不會傳送到伺服器。本網站不使用任何追蹤、分析或瀏覽器指紋技術。',
  'app.sourceLink': '在 GitHub 查看原始碼。',
  'app.titleWithSsid': ({ ssid }: { ssid: string }): string => `Wi-Fi Card - ${ssid}`,
  'app.noScript': '必須啟用 JavaScript 才能使用這個應用程式。',
  'app.noScriptSource': '歡迎查看原始碼。',
  'app.credit': ({ author }: { author: string }): string => `由 ${author} 製作`,

  'actions.print': '列印',

  'language.label': '語言',

  'validation.networkRequired': '請輸入網路名稱',
  'validation.passwordMin': ({ min }: { min: number }): string =>
    `密碼至少需要 ${min} 個字元，或將加密方式改為「無」`,
  'validation.identityRequired': '請輸入使用者名稱',
  'validation.passwordRequired': '請輸入密碼',

  'card.title.label': '卡片標題',
  'card.title.placeholder': 'Wi-Fi 連線資訊',
  'card.network.label': '網路名稱',
  'card.network.placeholder': 'Wi-Fi 網路名稱…',
  'card.password.label': '密碼',
  'card.password.placeholder': '密碼…',
  'card.eapMethod.label': 'EAP 方法',
  'card.eapMethod.placeholder': 'WPA2-EAP 方法…',
  'card.identity.label': 'EAP 使用者名稱',
  'card.identity.placeholder': '使用者名稱…',
  'card.scanHint': '掃描 QR Code 以連線',
  'card.qrLabel': 'Wi-Fi QR Code',

  'settings.layout': '版面',
  'settings.landscape': '橫向',
  'settings.portrait': '直向',
  'settings.hidePassword': '隱藏密碼',
  'settings.hiddenSsid': '隱藏 SSID',
  'settings.encryption': '加密方式',
  'settings.none': '無',
  'settings.eapMethod': 'EAP 方法',
} satisfies Messages

export default zhTW
