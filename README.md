# Wi-Fi Card

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/progamesigner/wificard)

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

The app runs on Cloudflare Workers with static assets, built by `@sveltejs/adapter-cloudflare`. The Worker renders each page so `?lang=` still sets `<html lang>` and the page text on the server. `wrangler.jsonc` holds the Worker settings.

```sh
npm run preview:cf       # build, then serve the Worker locally with wrangler dev (http://localhost:8787)
npm run deploy:dry-run   # build and bundle without uploading
npm run deploy           # build and deploy (needs `npx wrangler login` first)
```

Workers Builds (Worker > Settings > Build, connected to this GitHub repository):

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (default)
- Non-production branch deploy command: `npx wrangler versions upload` (default)
- Root directory: `/`

Node.js 24 is picked up from `.nvmrc`. The app needs no environment variables or secrets. To serve it on its own domain, add `wificard.0x148.com` under Worker > Settings > Domains & Routes > Custom domain.

`netlify.toml` is the previous Netlify setup. It stays only so the site can be rolled back to Netlify until DNS has moved to Cloudflare.

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
