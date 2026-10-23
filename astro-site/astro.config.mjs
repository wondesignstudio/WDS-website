import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wondesign.studio',
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  build: { format: 'directory' },
  vite: { build: { cssMinify: true } },
});
