# Wi-Fi Card Phase 2：i18n 設計與實作計畫

本文件原為設計與待辦；T1–T6 已在 `i18n-design` branch 實作，T7 的自動化部分已完成，人工驗收待辦，實作結果見第 10 節。依據 2026-10-13 唯讀取得的外部正本 `200 Projects/🟠 Wi-Fi Card - Phrase 2.md`，以及 repo 基準 commit `98ab8097cf6217207ab07fa1a1675e0b5b0ea2cc` 撰寫。外部正本的既定目標是 English、繁體中文、簡體中文三種語言，以及字體、按鈕樣式調整；以下技術細節是本文件的建議，不代表外部正本已採納。

## 1. 建議方案與範圍

- 語系識別碼採 `en`、`zh-TW`、`zh-CN`；English 是來源語言與最終 fallback。
- 使用 TypeScript 字典、Svelte 原生 store 與 context，暫不新增 i18n 執行期套件。三份字典一起載入，避免切換時等待網路。
- 用戶端解析順序為有效 URL `lang` → 儲存的手動偏好 → 瀏覽器語言 → English。
- 語言選單放在頁首，使用原生 `select`；介面與列印卡片使用同一語言。
- 只儲存語言偏好；Wi-Fi 欄位、卡片自訂標題維持頁面記憶體狀態。
- 保留現有 SSR、QR Code 資料格式與驗證規則。這次功能實作不順帶升級框架、遷移所有元件到 runes、增加翻譯平台或調整部署。

「預設 English」在本設計指未取得可用偏好時顯示英文；首次造訪若瀏覽器偏好繁體中文，掛載後會切為繁體中文。這是語言偵測的建議行為，不是永遠強制首次英文。

## 2. Repo 現況與限制

| 證據                                                 | 現況與設計影響                                                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`、`package-lock.json`                  | 宣告 Svelte `^5.55`，鎖定 **5.55.7**；SvelteKit **2.70.1**、Vite **8.1.0**、TypeScript **5.9.3**、Tailwind CSS **3.2.7**。不是 Svelte 3 專案。      |
| `src/routes/+layout.svelte`                          | 目前只載入 CSS 與 `<slot />`，適合作為每個元件樹的 i18n provider。                                                                                  |
| `src/routes/+page.svelte`                            | 管理輸入、驗證與列印；錯誤目前存成英文句子。頁首、說明、隱私文字、noscript、頁尾、meta description 都有待抽取字串。                                 |
| `src/routes/WifiCard.svelte`                         | 包含卡片欄位、placeholder、錯誤、掃描提示與 QR payload。卡片標題是未綁定的 input，預設文字只存在 placeholder。                                      |
| `src/routes/Setting.svelte`                          | 版面、隱藏密碼、隱藏 SSID、加密與 EAP 選項。目前有兩欄固定比例，需檢查翻譯後換行。                                                                  |
| `src/routes/QRCode.svelte`、圖示元件                 | QR Code 以 SVG 繪製；需補可存取名稱及裝飾圖示語意，不能翻譯編碼資料。                                                                               |
| `src/app.html`、`src/app.css`、`tailwind.config.cjs` | `html lang="en"` 固定；尚無專用中文字體配置。                                                                                                       |
| `svelte.config.js`                                   | 使用 `adapter-auto`；未看到關閉 SSR 或啟用 prerender 的設定，不以純 SPA 假設設計。                                                                  |
| `package.json`                                       | 有 `check`、`lint`、`build`，沒有單元或瀏覽器測試指令與測試框架。                                                                                   |
| `netlify.toml`                                       | Node 固定 `18.13.0`；lockfile 中 Vite 8 的 engines 要求 Node `^20.19.0` 或 `>=22.12.0`，有既存環境落差。實作驗證需使用相容 Node；部署設定另案處理。 |

元件仍使用 `export let`、`$:`、`on:` 等 legacy 語法，不能由語法推斷框架版本。外部正本的 REPL URL 指向 Svelte 3.55.1；本次無法取得該範例內容，不依其程式碼制定實作方式。

## 3. 函式庫評估

| 方案                                     | 優點                                                                                          | 本 repo 的成本與風險                                                                                                                                                                                                                | 建議                                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `svelte-i18n`                            | store 使用方式接近現有元件，提供訊息格式化、fallback 與字典管理。                             | 上游 `package.json` 版本為 4.0.1，peer range 接受 Svelte `^3`、`^4` 或 `^5`，包含 Svelte 5。但 README 仍提到從 singleton 改為 instances 的規劃；SSR 不能把不同請求的 locale 寫進共用可變 store。peer 宣告也不等於已在本 repo 驗證。 | 不作本階段首選；若未來需要 ICU 訊息功能，再重新評估 request isolation 與實際安裝版本。 |
| Paraglide JS                             | 編譯產生具型別的訊息函式，有 SvelteKit、SSR 與語系路由整合。                                  | 需新增編譯設定、產生檔案及 middleware 等整合；官方目前的切換流程預設重新載入頁面，與保留未儲存 Wi-Fi 輸入的需求需另外整合。                                                                                                         | 多頁、SEO 語系路由或翻譯協作擴大時優先重評。                                           |
| 小型 TypeScript 字典＋原生 store/context | 不增加 i18n 套件，可明確限定可用 key、參數型別與每個 SSR 元件樹的狀態；符合目前三語單頁規模。 | 自行負責 locale 正規化、fallback、完整性測試；不應延伸成自製 ICU、複數或日期格式引擎。                                                                                                                                              | **本計畫採用的建議方案。**                                                             |

相容性依據：[svelte-i18n package.json](https://raw.githubusercontent.com/kaisermann/svelte-i18n/main/package.json)、[svelte-i18n README](https://github.com/kaisermann/svelte-i18n)、[Paraglide SvelteKit 文件](https://paraglidejs.com/sveltekit)、[Svelte store 文件](https://svelte.dev/docs/svelte/stores)。以上於 2026-10-13 查閱；沒有在本次規劃工作安裝或試跑候選套件。

選擇小型字典是依本 repo 範圍做的工程判斷。若後續新增複數、複雜富文字、多頁路由或翻譯管理需求，重新評估現成函式庫，勿持續擴充自製解析器。

## 4. 語言解析、URL 與儲存

### 4.1 語言匹配規則

正規化以 BCP 47 標籤為輸入，忽略大小寫；格式錯誤或不支援的標籤回傳「無匹配」，不要在單一候選解析時立刻回退英文。依候選順序尋找第一個匹配，再套用最後的 `en` fallback。

| 輸入                                       | 結果                                                    |
| ------------------------------------------ | ------------------------------------------------------- |
| `en`、`en-US`、`en-GB` 等英文變體          | `en`                                                    |
| `zh-Hant`、`zh-Hant-*`                     | `zh-TW`，明確 script 優先於 region                      |
| `zh-Hans`、`zh-Hans-*`                     | `zh-CN`，明確 script 優先於 region                      |
| 無明確 script 的 `zh-TW`、`zh-HK`、`zh-MO` | `zh-TW`，使用同一份臺灣用語翻譯，不宣稱提供香港專屬翻譯 |
| 無明確 script 的 `zh-CN`、`zh-SG`          | `zh-CN`                                                 |
| 裸 `zh`、其他無法辨識書寫系統的中文變體    | 無匹配；繼續下一候選，最終 `en`，避免猜測繁簡偏好       |
| `ja`、`fr`、空字串、格式錯誤               | 無匹配                                                  |

例如瀏覽器順序 `['ja-JP', 'zh-Hant-TW', 'en-US']` 應選 `zh-TW`；`['en-US', 'zh-TW']` 應選 `en`。瀏覽器語言清單是按偏好排序的標籤；見 [Navigator.languages](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages)。

### 4.2 URL 與手動偏好

- 使用 `/?lang=en`、`/?lang=zh-TW`、`/?lang=zh-CN`；不增加 `/en/` 等路由或伺服器重新導向。
- URL 的 `lang` 先經上述正規化。重複參數固定讀取第一個；第一個無效就視為沒有有效 URL 語言，不掃描後面的同名參數。
- URL 語言只覆寫本次頁面，不自動取代已儲存的手動偏好。單純開啟別人分享的中文連結，不改掉自己的英文偏好。
- 只在使用者操作選單時，將 canonical locale 寫入 `localStorage['wificard.locale.v1']`，並將 URL 所有 `lang` 合併為一個 canonical 值。選 English 也寫 `lang=en`，確保分享後不被接收者瀏覽器語言蓋過。
- 使用 `$app/navigation` 的 `replaceState`，保留 SvelteKit 現有 page state、pathname、其他 query 與 hash；不重載、不新增每次切換的歷史項目、不清空表單。寫入 URL 不應觸發新的 SSR 請求。
- 自動偵測不寫 storage、不修改 URL。storage 僅接受三個 canonical 值；未知版本或非法內容忽略。
- 讀寫 storage 都捕捉例外，封鎖或容量錯誤不妨礙切換、列印；本次頁面仍以記憶體與 URL 運作。[localStorage 文件](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) 說明儲存與存取限制。
- 頁面導覽或上一頁／下一頁回到不同 URL 時，重新依完整優先順序解析；同頁閒置時不監聽其他分頁 storage 或系統 `languagechange` 強制切換，避免干擾輸入。

使用 SvelteKit 提供的 history 包裝 API，實作時依鎖定版本確認呼叫；見 [replaceState 文件](https://svelte.dev/docs/kit/$app-navigation#replaceState)。URL 更新失敗時仍完成當頁切換與可用的 storage 寫入，不能讓例外中斷介面。

### 4.3 SSR 與 hydration

1. 共用純函式解析 URL。新增 `src/routes/+layout.ts`，`load` 只回傳 URL 可決定的初始 locale，沒有匹配時回傳 `en`；不在伺服器碰 `window`、`navigator` 或 storage。
2. `src/hooks.server.ts` 用相同解析函式，把 `src/app.html` 的專用語言佔位符替換為白名單 locale。SSR 的 `<html lang>`、文字與 layout data 必須相同；不把原始 query 直接插入 HTML。
3. `+layout.svelte` 每次元件初始化都建立獨立 i18n instance，透過 context 提供給子元件。共用模組只能保存不可變字典與純函式，不能保存當前使用者 locale。
4. hydration 的第一個 render 完全沿用 SSR locale；`onMount` 後才讀 storage 與 `navigator.languages`，缺少清單時使用 `navigator.language`。一次更新 locale、文件 `lang`、meta 與畫面。
5. 導覽時同步更新既有 context instance，不能用 `{#key locale}` 重建整個頁面；確保 layout data 更新不覆蓋已解析的 browser preference。現有 legacy 元件若需訂閱 page URL，使用 `$app/stores` 的 page store，或明確的導覽 callback；不要假設 `$app/state` 在 legacy `$:` 中會反應式更新。

這符合 SvelteKit 避免在伺服器共享使用者狀態的原則；見 [State management](https://svelte.dev/docs/kit/state-management)。page 的反應式限制見 [$app/state](https://svelte.dev/docs/kit/$app-state)，文件語言的設定方式另見 [SvelteKit accessibility](https://svelte.dev/docs/kit/accessibility#The-lang-attribute)。

**已知取捨：** 沒有有效 `lang` 的首次請求先顯示英文，掛載後可能換成中文；不隱藏整頁等待偵測。有效 `lang` 的連結則從 SSR 就顯示指定語言。停用 JavaScript 時依 URL／英文顯示靜態內容與翻譯後的 noscript，互動功能仍需 JavaScript。

替代方案是以 cookie＋`Accept-Language` 在 SSR 決定語言，可減少初始語言跳動，但會增加 cookie、回應快取及伺服器協商規則。本階段建議 localStorage 方案；若要求「沒有 URL 也必須首屏即是偏好語言」，應先請使用者選擇 SSR cookie 方案或維持本設計，再實作相關部分，不可自行加入 cookie。

## 5. 字串抽取與狀態邊界

### 5.1 模組介面

建議檔案結構（此處均為未來新增）：

```text
src/lib/i18n/
  locales.ts          # Locale union、白名單、normalizeLocale、resolveLocale
  messages/en.ts      # 來源字典與訊息參數型別
  messages/zh-TW.ts   # 臺灣繁體中文
  messages/zh-CN.ts   # 簡體中文
  translate.ts        # 純函式、型別化 key/參數、英文 fallback
  context.ts          # createI18n(initialLocale)、set/get context
  browser.ts          # storage、URL 更新與瀏覽器偵測
src/lib/components/LanguageSelect.svelte
```

`createI18n` 回傳 locale 的唯讀 store、derived translator store 與受控 `setLocale`。元件用 `$t('settings.layout')` 等方式訂閱翻譯更新；純函式則顯式傳入 locale，不從全域讀取。瀏覽器副作用放在 browser 模組，不能混入翻譯函式。

使用穩定語意 key（例如 `card.network.label`），不要用英文整句當 key。字典採平面 dotted keys，從英文導出 key union；中文以 `satisfies` 檢查相同 key 集合。靜態項目是字串；需要參數的項目使用具型別的純函式，例如 `validation.passwordMin({ min })`，三語保持相同參數型別。這個規模不需要自行解析 ICU 或 `{placeholder}` 語法。

缺少翻譯時執行期回退同 key 英文；開發模式只記錄缺漏 key，不記錄插值資料。未知 key 視為程式錯誤，由型別與測試阻擋；執行期仍避免讓畫面崩潰。所有翻譯當作文字輸出，不使用 `{@html}`。

### 5.2 抽取清單

| 位置                       | 建議 key 群組與內容                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `+page.svelte` head/header | `app.description`、`app.privacy`、`app.sourceLink`、`app.sourceSentence`、`app.titleWithSsid`；保留品牌名 `Wi-Fi Card`。meta description 與可見說明可共用同 key。            |
| `+page.svelte` 其他區塊    | `app.noScript`、`app.noScriptSource`、`app.credit`、`actions.print`；作者名、GitHub 名稱與既有 URL 不翻譯。                                                                  |
| `+page.svelte` 驗證        | `validation.networkRequired`、`validation.passwordMin`、`validation.identityRequired`、`validation.passwordRequired`。                                                       |
| `WifiCard.svelte`          | `card.title.label`、`card.title.placeholder`、`card.network.*`、`card.password.*`、`card.eapMethod.*`、`card.identity.*`、`card.scanHint`、`card.qrLabel`。                  |
| `Setting.svelte`           | `settings.layout`、`settings.landscape`、`settings.portrait`、`settings.hidePassword`、`settings.hiddenSsid`、`settings.encryption`、`settings.none`、`settings.eapMethod`。 |
| 新增語言元件               | `language.label`；選項名稱固定使用各語言自稱 English、繁體中文、简体中文，且個別設定 `lang`。                                                                                |

包含連結的說明拆為完整句子與獨立連結句，讓 anchor 留在元件內；不把一個句子拆成必須維持英文詞序的片段。頁尾可採完整的 `app.credit({ author })` 文字作為作者首頁連結，愛心標為裝飾。不增加通用 HTML 插值引擎。

翻譯起始用語如下；簡體中文需獨立校對，不用繁簡字元轉換代替在地化。

| English                       | 繁體中文                 | 简体中文             |
| ----------------------------- | ------------------------ | -------------------- |
| Language                      | 語言                     | 语言                 |
| Print                         | 列印                     | 打印                 |
| Network name                  | 網路名稱                 | 网络名称             |
| Password                      | 密碼                     | 密码                 |
| Layout / Landscape / Portrait | 版面／橫向／直向         | 布局／横向／纵向     |
| Hide password / Hidden SSID   | 隱藏密碼／隱藏 SSID      | 隐藏密码／隐藏 SSID  |
| Encryption / None             | 加密方式／無             | 加密方式／无         |
| EAP method / EAP identity     | EAP 方法／EAP 使用者名稱 | EAP 方法／EAP 用户名 |
| Scan the QR code to connect   | 掃描 QR Code 以連線      | 扫描二维码以连接     |

### 5.3 不可被翻譯改寫的狀態

- `WIFI:`、`T/S/P/H/E/I`、`nopass`、`WEP`、`WPA`、`WPA2-EAP`、`PWD`、`TTLS`、布林值與 enum 值不翻譯。只換顯示 label；本次不增加目前 UI 未提供的 TTLS 選項。
- 使用者輸入的 SSID、密碼、EAP identity、自訂卡片標題不翻譯、不修剪、不做 Unicode 正規化，不放入 URL、storage、cookie、log 或遙測。
- 卡片標題新增綁定的 `customTitle`，未輸入時使用當前語言的 placeholder，清空後恢復 placeholder。切換語言不把 placeholder 寫成 value，也不覆蓋使用者文字。
- 驗證狀態改存錯誤代碼與參數，而非已翻譯句子。在 `+page.svelte` 依當前 translator 反應式產生錯誤字串，再沿用 `WifiCard` 的字串 props；如此已顯示的錯誤能立即換語言，仍保留輸入時清除錯誤的既有行為。
- 維持 SSID 必填、WEP 至少 5 字元、WPA 至少 8 字元、WPA2-EAP identity／password 必填的現有規則。本次不重新定義協定驗證或 QR escaping。
- 既有頁面 title 在有 SSID 時包含 SSID；保留此行為，不增加其他輸入到 title。截圖、測試報告與除錯只使用執行時產生的測試資料，不收錄真實連線資訊。
- 所有列印標籤跟隨目前 locale；QR payload 與 SVG 模組在只切語言時應完全相同。按列印前等待 Svelte `tick()`，讓最新翻譯與錯誤狀態完成更新；有錯誤時不得呼叫 `window.print()`。

## 6. 語言 UI、字體與按鈕

### 6.1 語言選單

放在頁首標題旁，窄螢幕換到下一行；使用明確的 label 與原生 select，不用國旗代表語言。順序固定 English、繁體中文、简体中文。選單以 `print:hidden` 隱藏，切換後保留鍵盤焦點與頁面捲動位置。

所有 input、select 都有可存取名稱；新增卡片標題 label 可用 `sr-only`。錯誤以 `aria-invalid`、`aria-describedby` 關聯欄位。QR Code 提供翻譯後的簡短名稱，不把 Wi-Fi 資料放進 accessible name；裝飾 SVG 設 `aria-hidden="true"`。

### 6.2 字體

維持系統字體，不新增外部字型請求。建議 `font-sans` 基礎為 `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`；依 `html:lang()` 加入適當 CJK fallback：

- `zh-TW`：`"PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`。
- `zh-CN`：`"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`。
- 英文也加上 CJK fallback，確保英文介面的中文 SSID 可顯示；上述名稱只表示本機可用字體，沒有安裝時交由系統 fallback。

本文建議 16px、行高 1.6，標題行高 1.25，欄位標籤與按鈕使用 500–600 字重；避免中文過度字距與全大寫。讓 input/select/button 繼承字體。卡片保持原本大小級距，以內容與 padding 決定高度，檢查 `h-8` 的標題是否裁切中文字。

窄螢幕允許設定欄、卡片橫向容器換行，使用 `min-width: 0` 與必要的 `overflow-wrap` 處理長提示；不要縮小文字掩蓋溢出。列印明確恢復使用者選定的橫向／直向卡片排列，不能讓螢幕 breakpoint 改寫列印版面。QR Code 保持正方形與既有編碼尺寸關係，不因翻譯縮扁或套用文字樣式。

### 6.3 按鈕與列印

列印按鈕由 `bg-blue-400` 建議改為 `bg-blue-600 text-white`、hover `bg-blue-700`、active `bg-blue-800`，搭配 `rounded-md`、至少 44px 高度、內容寬度與水平 padding。用 `focus-visible` 的 2px outline 與 offset 提供清楚焦點；只對顏色做 transition，支援 reduced motion。文字與背景的實測對比至少 4.5:1，焦點辨識不只依賴 hover。

語言 select 使用同樣的高度、圓角與 focus 樣式，保留原生選單操作。列印仍只顯示卡片；頁首、語言、設定、按鈕、頁尾不印出。繁簡字型、長標籤、使用者標題與 QR Code 都需人工檢查實際列印預覽。

## 7. 可逐項交付的實作任務

T1–T6 已完成；T7 仍有人工驗收項目，因此維持未勾選（見第 10 節）。agent 應在使用者指定的實作 worktree 依序執行；每項交付說明變更、驗證與限制。不得修改外部正本、部署、開 PR 或 merge。

- [x] **T1：建立可重現基準與測試入口。**
  - 讀取當時的 lockfile 與 Node engines，使用相容環境執行 `npm ci`、`npm run check`、`npm run lint`、`npm run build`，記錄既有失敗，不以升級整個工具鏈排除失敗。
  - 新增相容 Vite 8／Svelte 5 的 Vitest 與 Playwright 開發依賴、`test:unit`（一次性執行）、`test:e2e` 指令及設定；更新 lockfile。此處是未來工作，本文件不宣稱指令已存在。
  - 驗收：測試 runner 設定可載入，並能執行一個本機頁面 smoke test；locale 純函式測試由 T2 補上。記錄基準英文頁面與列印畫面。測試服務只能綁定本機，不碰正式站。

- [x] **T2：實作 locale 純函式與翻譯型別。依賴 T1。**
  - 新增 `locales.ts`、英文來源字典、`translate.ts`，定義 Locale、key、參數與缺漏 fallback；不引入 ICU 解析器。
  - 驗收：第 4 節所有匹配案例、script 優先、重複 query、無效輸入、候選順序通過單元測試；錯誤 key 與參數不能通過型別檢查。

- [x] **T3：完成三語字典與抽取清單。依賴 T2。**
  - 逐一比對第 5.2 節與原始碼，補齊完整三語文字、aria label、placeholder、head、noscript 與參數化錯誤；建立 key／參數完整性檢查。
  - 驗收：三語 key 完全一致，無空值、無漏參數；繁中使用臺灣用語，簡中獨立校對。英文文案如修正大小寫，需記錄差異與理由。

- [x] **T4：串接 SSR、context 與瀏覽器偏好。依賴 T2、T3。**
  - 修改 `app.html`、新增 hook／layout load，實作每個元件樹獨立 store、browser 模組、首次掛載與導覽同步。
  - 驗收：不同語言的並行 SSR 回應無污染；伺服器不存取 browser API；有效 URL 的 HTML 語言與內容一致；無 URL 時沒有 hydration mismatch；storage 拒絕存取仍可運作。

- [x] **T5：新增切換 UI 並抽換現有文字。依賴 T4。**
  - 新增 `LanguageSelect.svelte`，更新 page、card、settings、head 與 noscript；落實 URL replace、storage 手動寫入、錯誤代碼、自訂標題與可存取名稱。
  - 驗收：在已有輸入、WPA2-EAP 欄位、驗證錯誤時連續切換三語，文字立即更新、輸入與設定不變；QR payload 不變、URL／storage 沒有輸入資料。

- [x] **T6：調整字體、控制項與列印版面。依賴 T5。**
  - 修改 `app.css`、Tailwind 設定及必要元件 class；處理原生 select、按鈕狀態、字型 fallback、長文字換行與列印 override。
  - 驗收：三語在 320px、375px、768px、1280px 與 200% 縮放下無頁面水平溢出、無文字遮擋；鍵盤焦點清楚，按鈕對比通過量測；沒有新增外部字型請求。

- [ ] **T7：完成回歸、人工驗收與交接。依賴 T1–T6。**
  - 依第 8 節補齊測試，執行 `npm run check`、`npm run lint`、`npm run test:unit`、`npm run test:e2e`、`npm run build`。只有在 T1 已新增測試指令後才能使用。
  - 人工檢查 Chromium、Firefox、WebKit 的操作與列印；至少用實際手機掃描一份三語卡片中的測試 QR Code，確認掃描結果一致。
  - 驗收：提供測試結果、三語畫面與六種語言／版面列印預覽紀錄、未解限制；只使用非敏感測試資料。更新 README 的新增語言方式與測試指令，交付 commit，不自行部署。

## 8. 測試矩陣與完成條件

| 層級           | 必測情境                                                                                         | 通過條件                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 單元           | locale 正規化、script／region 衝突、瀏覽器順序、無效 URL／storage、三層優先順序、缺 key fallback | 結果符合第 4 節；單一不支援候選不會提前選英文；fallback 不洩漏插值資料。                              |
| 型別／字典     | 三語 key、字串／函式種類與參數型別                                                               | 缺 key、多 key、缺參數均能被檢查攔下；正式字典全部通過。                                              |
| SSR            | `?lang=en/zh-TW/zh-CN`、無效 lang、無 JavaScript、交錯且並行的兩種 locale 請求                   | 原始 HTML 的 lang、文字、head、noscript 正確；無跨請求語言污染。                                      |
| 瀏覽器初始載入 | URL 中文＋storage 英文＋browser 另一語；無 URL 有 storage；僅 browser；全部不支援                | 分別使用 URL、storage、browser、en；console 無 hydration warning。                                    |
| 儲存與歷史     | storage 讀／寫擲例外、重新整理、移除 lang 後再造訪、保留 query/hash、上一頁／下一頁              | 切換不重載；手動偏好可延續；URL 語言不偷偷改儲存偏好；歷史導覽回復符合當下優先順序。                  |
| 表單與錯誤     | 三語 × 空 SSID、WEP 4/5 字元、WPA 7/8 字元、EAP 必填；先產生錯誤再切語言                         | 驗證邊界維持既有規則；錯誤立即翻譯；輸入事件仍清除相關錯誤；不合法時列印呼叫為零。                    |
| 狀態保留       | 自訂標題、中文／特殊字元輸入、hiddenSSID、hidePassword、兩種 layout、各 encryption mode          | 切換不重建頁面、不更改任何輸入或協定值；清空自訂標題後 placeholder 跟隨語言。                         |
| QR 回歸        | 對固定測試狀態記錄切換前後 payload／SVG；包括既有 escaping 涉及字元                              | 只切語言時輸出相同；用獨立 decoder 或手機檢查解碼內容，不只比對自製快照。若發現既有 QR 問題另行回報。 |
| 列印           | 三語 × Landscape／Portrait；加測 hidePassword、NOPASS、WPA2-EAP                                  | 六個基本組合可讀、不裁切、QR 正方形；非卡片區塊隱藏；列印呼叫發生於最新 DOM 更新後。                  |
| 可存取性／外觀 | 鍵盤操作、label、lang、錯誤關聯、各控制項狀態、320px 與 200% 縮放                                | 焦點可見、名稱正確、沒有水平溢出；翻譯不只靠顏色辨識；對比與點選區域符合第 6 節。                     |
| 資料邊界       | 攔截切換／輸入時的網路請求，檢查 URL、storage、cookie 與 log                                     | 沒有 Wi-Fi 欄位或自訂標題內容；storage 只有語言值；沒有新增字型／翻譯／追蹤外部請求。                 |

Playwright 可用 `window.print` stub 驗證呼叫與呼叫當下 DOM，並用 print media 檢查可見性；這不等於完整驗證系統列印對話框或紙張輸出。PDF／真實列印預覽、字型 fallback、手機掃描仍需人工驗收。E2E 以瀏覽器觀察行為為主，不為測試把真實輸入暴露到全域變數。

完成標準是三語功能、SSR 隔離、狀態保留、資料邊界、字型／按鈕與列印驗收全數通過。既有基準失敗須逐項列明，不能寫成「全部通過」；外部正本的待辦是否勾選由使用者維護。

## 9. 決策邊界與交接注意事項

本次規劃沒有需要使用者先提供才能完成文件的資訊。小型字典、localStorage 與系統字體都是本文件提出的推薦方案，並未實作或改動外部正本。

若實作時新增以下要求，先列出選項與建議並等待使用者決定：

- **無 URL 也要首屏即顯示偏好語言：** 選 cookie＋SSR 協商，或保留本方案的掛載後切換；沒有新要求時建議後者。
- **品牌指定字體或各語言字形必須跨平台完全一致：** 選自託管字型，或保留系統字體；目前建議系統字體。採自託管前需取得字型與授權，不能自行接外部字型服務。
- **需要修改部署環境才能驗證線上結果：** 選另案修正 Node／部署設定，或只完成本機驗證；本任務邊界建議只驗證本機，不變更線上服務。

原規劃交付只新增本文件；實作結果與驗證範圍見第 10 節。

## 10. 實作紀錄（2026-10-13）

依本計畫預設做法實作：小型 TypeScript 字典、localStorage 手動偏好、URL `lang` 決定 SSR 語言、系統字體。**未**採用 cookie＋SSR 協商；沒有有效 `lang` 的首次載入仍先顯示英文，掛載後再套用儲存偏好或瀏覽器語言（第 4.3 節的已知取捨）。

### 10.1 基準與環境修正（T1）

- 驗證環境 Node 24.21.0（符合 Vite 8 engines）；`npm ci` 成功。
- 既有失敗一：在 `<repo>/.worktrees/<name>` 內執行 `build`、`check` 時出現 `TSCONFIG_ERROR: Tsconfig not found`。原因是 oxc 會往上層目錄找 tsconfig，撞到主 checkout 的 `tsconfig.json`；主 checkout 沒有 `.svelte-kit/`，`extends` 失效。修正方式：在 `tsconfig.json` 寫明 `include`，清單對齊 SvelteKit 自動產生的設定。另外照 SvelteKit 的警告移除 `baseUrl`，因為它會讓 `$lib` 別名無法產生。主 checkout 沒有改動。
- 既有失敗二：`prettier --check` 有 8 個檔案格式不符，所以 ESLint 從未執行；ESLint 跑起來後又報出 `QRCode.svelte` 的 `no-extra-boolean-cast`。修正方式：只做格式化，以及把 `!!data[index]` 改成 `data[index]`，行為不變。
- 新增 Vitest 5 與 Playwright 1.64。單元測試另用 `vitest.config.ts`，不載入 SvelteKit plugin，因為依賴預先最佳化在 worktree 會撞到上述 tsconfig 問題，而單元測試只涵蓋純 TS 模組。指令有 `test:unit`、`test:e2e`（Chromium）、`test:e2e:all`（三種瀏覽器）與 `test`。
- `netlify.toml` 的 Node 18 與 Vite 8 不相容這點維持原狀，留待另案處理。

### 10.2 與計畫的差異

- 英文文案只改兩處：`Scan the QRCode to connect` 改為 `Scan the QR code to connect`，`Wifi Network Name ...` 改為 `Wi-Fi network name ...`，讓寫法和品牌名稱一致。其他英文標籤保留原本的大小寫。
- 隱私說明後的連結改用完整句子 `app.sourceLink`（View the source code on GitHub.）當連結文字，所以沒有用到 `app.sourceSentence`。頁尾改為 `app.credit({ author })` 的完整文字連結（例如 Made by progamesigner），後面接一個 `aria-hidden` 的裝飾愛心。
- 單元測試要注入缺 key 的字典，所以 `translate.ts` 另外匯出 `translateFrom`；正式字典仍保持凍結、不可變。
- 版面：設定區在 `sm` 以下改為上下堆疊；卡片本身不使用 breakpoint，列印時仍依使用者選的橫向／直向排列。容器加上 16px 側邊留白，列印時取消。

### 10.3 驗證結果

- `npm run lint`、`npm run check`、`npm run build` 全數通過。
- `npm run test:unit`：3 個檔案、58 項通過，涵蓋第 4 節的匹配表、script 優先、重複 query、候選順序、storage 例外、URL 合併、三語 key／種類／參數完整性，以及用 `@ts-expect-error` 驗證錯誤 key 與參數會被型別檢查攔下（由 `npm run check` 驗證）。
- `npm run test:e2e`（Chromium）30 項通過；Firefox 同一套 30 項也通過。涵蓋原始 HTML 的 lang／文字／meta／noscript、24 個交錯並行請求無語言污染、URL > storage > 瀏覽器 > 英文的優先順序、無 hydration 警告、storage 擲例外時仍可運作、切換語言時輸入／設定／錯誤／自訂標題／QR path 不變、URL 只合併 `lang` 並保留其他 query 與 hash、不新增歷史項目、上一頁／下一頁會重新解析、有錯誤時不列印、列印時 DOM 已是最新語言、print media 只顯示卡片且 QR Code 維持正方形、三語在 320／375／768／1280px 沒有水平溢出、字體順序依語言切換、列印按鈕對比至少 4.5:1 且高度至少 44px、沒有外部請求，且 URL／storage／cookie 不含輸入資料。

### 10.4 尚未完成的人工驗收（T7）

- WebKit：本機缺少系統函式庫（需要 sudo 安裝），沒有執行。
- 驗證主機沒有安裝 CJK 字型，截圖中的中文顯示為方框，因此實際字形、`h-8` 標題是否裁切中文，需在有中文字型的裝置上目視確認。
- 真實列印預覽與 PDF（三語 × 橫向／直向）、200% 縮放（目前以 320–768px 寬度近似），以及用手機實際掃描三語卡片的測試 QR Code，都還沒做。
