import { default as adapter } from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter(),
  },
  preprocess: vitePreprocess(),
}
