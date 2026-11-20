# Wi-Fi Card

https://wificard.0x148.com

Print a simple card with Wi-Fi details. Tape it to fridge, keep it in wallet, or display it in store, etc.

## Development

Once you've installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying to Cloudflare

The app runs on Cloudflare Workers, built by `@sveltejs/adapter-cloudflare`. The Worker renders each page, so `?lang=` sets `<html lang>` and the page text on the server. `wrangler.jsonc` holds the Worker settings.

```sh
npm run build && npx wrangler dev   # serve the built Worker locally (http://localhost:8787)
```

GitHub Actions deploys the app with `.github/workflows/deploy.yaml`. Every push runs the checks, the lint, the unit and end-to-end tests, and the build. A push to `main` deploys to production on `wificard.0x148.com`. A push to any other branch uploads a preview version on `workers.dev` under an alias named after the branch, and the run summary shows its URL. The workflow needs the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The app needs no runtime variables or secrets.

## Testing

```sh
npm run check      # Svelte and TypeScript checks
npm run lint       # Prettier and ESLint
npm run test:unit  # Vitest unit tests for framework-free modules
npm run test:e2e   # Playwright against a local production build (Chromium)
```

`npm run test:e2e:all` also runs Firefox and WebKit. Install browsers first with `npx playwright install`.

## Languages

The app supports English (`en`), Traditional Chinese (`zh-TW`) and Simplified Chinese (`zh-CN`). The locale is chosen from the `?lang=` query parameter, then the language saved from the header menu, then the browser languages, and finally English. Only the language preference is stored; Wi-Fi details never leave the page.

Messages live in `src/lib/i18n/messages/`. `en.ts` is the source dictionary; every other dictionary must have the same keys and parameter types (`satisfies Messages`), which `npm run check` and the unit tests enforce. To add a language:

1. Add the locale to `LOCALES` and its matching rules to `normalizeLocale` in `src/lib/i18n/locales.ts`.
2. Add a dictionary under `src/lib/i18n/messages/` and register it in `src/lib/i18n/translate.ts`.
3. Add the language's own name to `src/lib/components/LanguageSelect.svelte` and, if needed, CJK font fallbacks in `src/app.css`.
4. Extend the unit and end-to-end tests.

# Contributions

Special thanks to [wifi-card](https://github.com/bndw/wifi-card) for the idea inspiration.
