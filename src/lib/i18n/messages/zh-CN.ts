import type { Messages } from './en'

const zhCN = {
  'app.description':
    '打印一张写有 Wi-Fi 信息的简易卡片，可以贴在冰箱上、放进钱包，或摆在店里展示。',
  'app.privacy': '你的 Wi-Fi 信息绝不会发送到服务器。本网站不使用任何跟踪、分析或浏览器指纹技术。',
  'app.sourceLink': '在 GitHub 查看源代码。',
  'app.titleWithSsid': ({ ssid }: { ssid: string }): string => `Wi-Fi Card - ${ssid}`,
  'app.noScript': '需要启用 JavaScript 才能使用此应用。',
  'app.noScriptSource': '欢迎查看源代码。',
  'app.credit': ({ author }: { author: string }): string => `由 ${author} 制作`,

  'actions.print': '打印',

  'language.label': '语言',

  'validation.networkRequired': '请输入网络名称',
  'validation.passwordMin': ({ min }: { min: number }): string =>
    `密码至少需要 ${min} 个字符，或将加密方式改为“无”`,
  'validation.identityRequired': '请输入用户名',
  'validation.passwordRequired': '请输入密码',

  'card.title.label': '卡片标题',
  'card.title.placeholder': 'Wi-Fi 连接信息',
  'card.network.label': '网络名称',
  'card.network.placeholder': 'Wi-Fi 网络名称…',
  'card.password.label': '密码',
  'card.password.placeholder': '密码…',
  'card.eapMethod.label': 'EAP 方法',
  'card.eapMethod.placeholder': 'WPA2-EAP 方法…',
  'card.identity.label': 'EAP 用户名',
  'card.identity.placeholder': '用户名…',
  'card.scanHint': '扫描二维码以连接',
  'card.qrLabel': 'Wi-Fi 二维码',

  'settings.layout': '布局',
  'settings.landscape': '横向',
  'settings.portrait': '纵向',
  'settings.hidePassword': '隐藏密码',
  'settings.hiddenSsid': '隐藏 SSID',
  'settings.encryption': '加密方式',
  'settings.none': '无',
  'settings.eapMethod': 'EAP 方法',
} satisfies Messages

export default zhCN
