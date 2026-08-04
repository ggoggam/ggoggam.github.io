import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import mdx from "@mdx-js/rollup";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import path from "path";
import { readdirSync } from "fs";

function ggoggamImagesPlugin() {
  const virtualId = "virtual:ggoggam-images";
  const resolvedId = "\0" + virtualId;
  return {
    name: "ggoggam-images",
    resolveId(id: string) {
      if (id === virtualId) return resolvedId;
    },
    load(id: string) {
      if (id === resolvedId) {
        const dir = path.join(process.cwd(), "public", "ggoggam");
        // Each photo ships as a 400/800 webp pair plus a 400 jpg fallback
        // (see scripts/optimize-photos.sh). Group them back into one entry.
        const stems = [
          ...new Set(
            readdirSync(dir)
              .map((f: string) => f.match(/^(.+)-(?:400|800)\.(?:webp|jpg)$/)?.[1])
              .filter((s): s is string => Boolean(s))
          ),
        ].sort();
        const images = stems.map((stem) => ({
          webp400: `/ggoggam/${stem}-400.webp`,
          webp800: `/ggoggam/${stem}-800.webp`,
          jpg400: `/ggoggam/${stem}-400.jpg`,
        }));
        return `export const images = ${JSON.stringify(images)}`;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: "frontmatter" }],
          remarkMath,
          remarkGfm,
        ],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypePrettyCode,
            {
              // Dual theme: Shiki emits --shiki-light/--shiki-dark on every
              // token and globals.css picks one, so code follows the theme
              // without shipping two stylesheets.
              keepBackground: false,
              // High-contrast variants: the standard github themes are tuned
              // for a pure-white ground and several token colors land under
              // 4.5:1 on the code block's sunk background.
              theme: {
                light: "github-light-high-contrast",
                dark: "github-dark-high-contrast",
              },
            },
          ],
          rehypeKatex,
        ],
      }),
    },
    react({ include: /\.(tsx|ts|jsx|js|mdx|md)$/ }),
    ggoggamImagesPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
