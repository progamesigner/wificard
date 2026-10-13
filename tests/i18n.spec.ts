import { expect, test, type Page } from '@playwright/test'

const STORAGE_KEY = 'wificard.locale.v1'

// Runtime-only test data; never real network details.
const SSID = 'Test Net;42'
const PASSWORD = 'pw-test-123'

const labels = {
  en: { lang: 'en', print: 'Print', network: 'Network', password: 'Password', layout: 'Layout' },
  'zh-TW': { lang: 'zh-TW', print: '列印', network: '網路名稱', password: '密碼', layout: '版面' },
  'zh-CN': { lang: 'zh-CN', print: '打印', network: '网络名称', password: '密码', layout: '布局' },
} as const

type Locale = keyof typeof labels

async function open(page: Page, path = '/'): Promise<void> {
  await page.goto(path, { waitUntil: 'networkidle' })
}

async function expectLocale(page: Page, locale: Locale): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('lang', locale)
  await expect(page.getByRole('button', { name: labels[locale].print })).toBeVisible()
  await expect(page.getByRole('combobox')).toHaveValue(locale)
}

async function qrPath(page: Page): Promise<string | null> {
  return page.locator('svg[role="img"] path').getAttribute('d')
}

async function stubPrint(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __prints: Array<string> }
    w.__prints = []
    window.print = () => {
      w.__prints.push(document.documentElement.lang + '|' + document.body.innerText)
    }
  })
}

function prints(page: Page): Promise<Array<string>> {
  return page.evaluate(() => (window as unknown as { __prints: Array<string> }).__prints)
}

function collectHydrationWarnings(page: Page): Array<string> {
  const warnings: Array<string> = []
  page.on('console', message => {
    if (/hydrat/i.test(message.text())) {
      warnings.push(message.text())
    }
  })
  return warnings
}

test.describe('server rendering', () => {
  test('renders the URL locale in the raw HTML', async ({ request }) => {
    for (const [query, locale, text] of [
      ['?lang=zh-TW', 'zh-TW', '列印'],
      ['?lang=zh-CN', 'zh-CN', '打印'],
      ['?lang=en', 'en', 'Print'],
      ['?lang=zh-hant-hk', 'zh-TW', '列印'],
      ['?lang=zh-CN&lang=en', 'zh-CN', '打印'],
      ['?lang=xx', 'en', 'Print'],
      ['?lang=%22%3E%3Cscript%3E', 'en', 'Print'],
      ['', 'en', 'Print'],
    ] as const) {
      const html = await (await request.get(`/${query}`)).text()
      expect(html, query).toContain(`<html lang="${locale}">`)
      expect(html, query).toContain(text)
      expect(html, query).not.toContain('<script>"')
    }

    const zhTW = await (await request.get('/?lang=zh-TW')).text()
    expect(zhTW).toContain('content="列印一張寫著 Wi-Fi 資訊的簡易卡片')
    expect(zhTW).toContain('必須啟用 JavaScript 才能使用這個應用程式。')
  })

  test('does not leak locales between concurrent requests', async ({ request }) => {
    const locales: Array<Locale> = Array.from(
      { length: 24 },
      (_, i) => (['en', 'zh-TW', 'zh-CN'] as const)[i % 3]
    )
    const pages = await Promise.all(
      locales.map(async locale => (await request.get(`/?lang=${locale}`)).text())
    )
    pages.forEach((html, i) => {
      const locale = locales[i]
      expect(html).toContain(`<html lang="${locale}">`)
      expect(html).toContain(`>${labels[locale].print}<`)
      for (const other of Object.keys(labels) as Array<Locale>) {
        if (other !== locale) {
          expect(html).not.toContain(`>${labels[other].print}<`)
        }
      }
    })
  })
})

test.describe('initial locale', () => {
  test.use({ locale: 'zh-TW' })

  test('URL wins over storage and browser language', async ({ page }) => {
    const warnings = collectHydrationWarnings(page)
    await page.addInitScript(key => localStorage.setItem(key, 'en'), STORAGE_KEY)
    await open(page, '/?lang=zh-CN')
    await expectLocale(page, 'zh-CN')
    // Opening a shared link does not replace the saved manual preference.
    expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe('en')
    expect(warnings).toEqual([])
  })

  test('storage wins over browser language without a URL locale', async ({ page }) => {
    await page.addInitScript(key => localStorage.setItem(key, 'zh-CN'), STORAGE_KEY)
    await open(page)
    await expectLocale(page, 'zh-CN')
    expect(page.url()).not.toContain('lang=')
  })

  test('browser language applies after mount without hydration warnings', async ({ page }) => {
    const warnings = collectHydrationWarnings(page)
    await open(page)
    await expectLocale(page, 'zh-TW')
    expect(page.url()).not.toContain('lang=')
    expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBeNull()
    expect(warnings).toEqual([])
  })

  test('works when storage access throws', async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error('blocked')
      }
      Storage.prototype.setItem = () => {
        throw new Error('blocked')
      }
    })
    await open(page)
    await expectLocale(page, 'zh-TW')
    await page.getByRole('combobox').selectOption('zh-CN')
    await expectLocale(page, 'zh-CN')
    expect(new URL(page.url()).searchParams.get('lang')).toBe('zh-CN')
  })
})

test.describe('unsupported browser language', () => {
  test.use({ locale: 'ja-JP' })

  test('falls back to English', async ({ page }) => {
    await open(page)
    await expectLocale(page, 'en')
  })
})

test.describe('switching language', () => {
  test('keeps input, settings, errors and QR code while translating', async ({ page }) => {
    await stubPrint(page)
    await open(page, '/?foo=1&lang=fr&lang=xx#top')
    await expectLocale(page, 'en')
    const historyLength = await page.evaluate(() => history.length)

    await page.getByRole('textbox', { name: 'Card title', exact: true }).fill('Guest 客人')
    await page.getByRole('textbox', { name: 'Network', exact: true }).fill(SSID)
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('short')
    await page.locator('input[name="layout"][value="Portrait"]').check()
    await page.getByRole('button', { name: 'Print' }).click()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Password', exact: true })).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    const qr = await qrPath(page)

    await page.getByRole('combobox').selectOption('zh-TW')
    await expectLocale(page, 'zh-TW')
    await expect(page.getByText('密碼至少需要 8 個字元，或將加密方式改為「無」')).toBeVisible()
    await expect(page.getByRole('textbox', { name: '網路名稱', exact: true })).toHaveValue(SSID)
    await expect(page.getByRole('textbox', { name: '密碼', exact: true })).toHaveValue('short')
    await expect(page.getByRole('textbox', { name: '卡片標題', exact: true })).toHaveValue(
      'Guest 客人'
    )
    await expect(page.locator('input[name="layout"][value="Portrait"]')).toBeChecked()
    expect(await qrPath(page)).toBe(qr)

    await page.getByRole('combobox').selectOption('zh-CN')
    await expectLocale(page, 'zh-CN')
    await expect(page.getByText('密码至少需要 8 个字符，或将加密方式改为“无”')).toBeVisible()
    expect(await qrPath(page)).toBe(qr)

    // Typing still clears the related error.
    await page.getByRole('textbox', { name: '密码', exact: true }).fill(PASSWORD)
    await expect(page.getByText('密码至少需要')).toHaveCount(0)

    const url = new URL(page.url())
    expect(url.searchParams.getAll('lang')).toEqual(['zh-CN'])
    expect(url.searchParams.get('foo')).toBe('1')
    expect(url.hash).toBe('#top')
    expect(await page.evaluate(() => history.length)).toBe(historyLength)
    expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({ [STORAGE_KEY]: 'zh-CN' })
    expect(page.url()).not.toContain('Test')
    expect(await prints(page)).toEqual([])
  })

  test('translates WPA2-EAP fields and errors', async ({ page }) => {
    await open(page)
    await page.locator('input[name="encryption"][value="WPA2-EAP"]').check()
    await page.getByRole('button', { name: 'Print' }).click()
    await expect(page.getByText('Network name is required')).toBeVisible()
    await expect(page.getByText('Username is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()

    await page.getByRole('combobox').selectOption('zh-TW')
    await expect(page.getByRole('textbox', { name: 'EAP 方法', exact: true })).toHaveValue('PWD')
    await expect(page.getByText('請輸入網路名稱')).toBeVisible()
    await expect(page.getByText('請輸入使用者名稱')).toBeVisible()
    await expect(page.getByText('請輸入密碼')).toBeVisible()
    await expect(
      page.getByRole('textbox', { name: 'EAP 使用者名稱', exact: true })
    ).toHaveAttribute('aria-invalid', 'true')
  })

  test('empty card title placeholder follows the language', async ({ page }) => {
    await open(page)
    const title = page.getByRole('textbox', { name: 'Card title', exact: true })
    await expect(title).toHaveAttribute('placeholder', 'Wi-Fi Login')
    await page.getByRole('combobox').selectOption('zh-TW')
    await expect(page.getByRole('textbox', { name: '卡片標題', exact: true })).toHaveAttribute(
      'placeholder',
      'Wi-Fi 連線資訊'
    )
    await expect(page.getByRole('textbox', { name: '卡片標題', exact: true })).toHaveValue('')
  })

  test('saved preference persists and URL locale stays per page', async ({ page }) => {
    await open(page)
    await page.getByRole('combobox').selectOption('zh-TW')
    await open(page, '/')
    await expectLocale(page, 'zh-TW')
    await open(page, '/?lang=en')
    await expectLocale(page, 'en')
    await open(page, '/')
    await expectLocale(page, 'zh-TW')
  })

  test('back and forward re-resolve the locale', async ({ page }) => {
    await open(page, '/?lang=zh-CN')
    await page.getByRole('combobox').selectOption('zh-TW')
    await open(page, '/?lang=en')
    await expectLocale(page, 'en')
    await page.goBack({ waitUntil: 'networkidle' })
    await expectLocale(page, 'zh-TW')
    await page.goForward({ waitUntil: 'networkidle' })
    await expectLocale(page, 'en')
  })
})

test.describe('printing', () => {
  test('does not print invalid cards and prints after the latest update', async ({ page }) => {
    await stubPrint(page)
    await open(page, '/?lang=zh-TW')
    await page.getByRole('button', { name: '列印' }).click()
    await expect(page.getByText('請輸入網路名稱')).toBeVisible()
    expect(await prints(page)).toEqual([])

    await page.getByRole('textbox', { name: '網路名稱', exact: true }).fill(SSID)
    await page.getByRole('textbox', { name: '密碼', exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: '列印' }).click()
    await expect.poll(() => prints(page)).toHaveLength(1)
    const [snapshot] = await prints(page)
    expect(snapshot.startsWith('zh-TW|')).toBe(true)
    expect(snapshot).toContain('掃描 QR Code 以連線')
    expect(snapshot).not.toContain('請輸入網路名稱')
  })

  test('print media shows only the card in the chosen layout', async ({ page }) => {
    await open(page, '/?lang=zh-CN')
    await page.locator('input[name="layout"][value="Portrait"]').check()
    await page.emulateMedia({ media: 'print' })
    await expect(page.getByRole('combobox')).toBeHidden()
    await expect(page.getByRole('button', { name: '打印' })).toBeHidden()
    await expect(page.locator('header')).toBeHidden()
    await expect(page.locator('footer')).toBeHidden()
    await expect(page.getByText('扫描二维码以连接')).toBeVisible()
    const box = await page.locator('svg[role="img"]').boundingBox()
    expect(box).not.toBeNull()
    expect(Math.abs((box?.width ?? 0) - (box?.height ?? 1))).toBeLessThan(1)
  })
})

test.describe('layout', () => {
  for (const width of [320, 375, 768, 1280]) {
    for (const locale of Object.keys(labels) as Array<Locale>) {
      test(`${locale} at ${width}px has no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await open(page, `/?lang=${locale}`)
        await page.locator('input[name="encryption"][value="WPA2-EAP"]').check()
        await page.getByRole('button', { name: labels[locale].print }).click()
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        expect(overflow).toBeLessThanOrEqual(0)
      })
    }
  }

  test('keyboard focus on the print button is visible', async ({ page }) => {
    await open(page)
    await page.getByRole('button', { name: 'Print' }).focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    const outline = await page
      .getByRole('button', { name: 'Print' })
      .evaluate(element => getComputedStyle(element).outlineStyle)
    expect(outline).not.toBe('none')
  })
})

test.describe('fonts and controls', () => {
  test('font stack follows the document language', async ({ page }) => {
    const fontFamily = () => page.evaluate(() => getComputedStyle(document.body).fontFamily)
    await open(page, '/?lang=zh-TW')
    const tw = await fontFamily()
    expect(tw.indexOf('PingFang TC')).toBeGreaterThan(-1)
    expect(tw.indexOf('PingFang TC')).toBeLessThan(tw.indexOf('PingFang SC'))

    await page.getByRole('combobox').selectOption('zh-CN')
    const cn = await fontFamily()
    expect(cn.indexOf('PingFang SC')).toBeLessThan(cn.indexOf('PingFang TC'))

    await page.getByRole('combobox').selectOption('en')
    expect(await fontFamily()).toContain('Noto Sans TC')
  })

  test('print button meets size and contrast targets', async ({ page }) => {
    await open(page)
    const button = page.getByRole('button', { name: 'Print' })
    const style = await button.evaluate(element => {
      const computed = getComputedStyle(element)
      return {
        color: computed.color,
        background: computed.backgroundColor,
        height: element.getBoundingClientRect().height,
      }
    })
    const luminance = (rgb: string) => {
      const [r, g, b] = (rgb.match(/\d+/g) ?? [])
        .slice(0, 3)
        .map(Number)
        .map(value => {
          const c = value / 255
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    const [light, dark] = [luminance(style.color), luminance(style.background)].sort(
      (a, b) => b - a
    )
    expect((light + 0.05) / (dark + 0.05)).toBeGreaterThanOrEqual(4.5)
    expect(style.height).toBeGreaterThanOrEqual(44)
  })
})

test.describe('data boundary', () => {
  test('no Wi-Fi input leaves the page and no external requests are made', async ({ page }) => {
    const requests: Array<string> = []
    page.on('request', request => requests.push(request.url()))
    await open(page)
    await page.getByRole('textbox', { name: 'Card title', exact: true }).fill('Title-Secret')
    await page.getByRole('textbox', { name: 'Network', exact: true }).fill(SSID)
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(PASSWORD)
    await page.getByRole('combobox').selectOption('zh-TW')
    await page.getByRole('combobox').selectOption('en')

    for (const url of requests) {
      expect(new URL(url).origin).toBe('http://127.0.0.1:4173')
      for (const value of ['Title-Secret', 'Test', PASSWORD]) {
        expect(decodeURIComponent(url)).not.toContain(value)
      }
    }
    const state = await page.evaluate(() => ({
      url: location.href,
      storage: JSON.stringify({ ...localStorage, ...sessionStorage }),
      cookie: document.cookie,
    }))
    expect(state.storage).toBe(JSON.stringify({ [STORAGE_KEY]: 'en' }))
    expect(state.cookie).toBe('')
    for (const value of ['Title-Secret', 'Test', PASSWORD]) {
      expect(state.url).not.toContain(value)
    }
  })
})
