import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import UnoCSS from 'unocss/astro';

export default defineConfig({
  // used to generate images
  site: 'https://ggoggam.github.io/',
  trailingSlash: 'ignore',
  integrations: [
    sitemap(), 
    UnoCSS({ injectReset: true })
  ],
  markdown: {
    remarkPlugins: [
      'remark-math',
    ],
    rehypePlugins: [
        ['rehype-katex', {
        // Katex plugin options
        }]
    ]
  },
  experimental: {
    devOverlay: true,
  },
  vite: {
    optimizeDeps: {
      exclude: ['@resvg/resvg-js'],
    },
  },
});
