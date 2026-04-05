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
import rehypeAutoLinkHeadings from "rehype-autolink-headings";
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
        const files = readdirSync(dir)
          .sort()
          .map((f: string) => `/ggoggam/${f}`);
        return `export const images = ${JSON.stringify(files)}`;
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
          [rehypeAutoLinkHeadings, { behavior: "wrap", properties: { className: "anchor" } }],
          [rehypePrettyCode, { keepBackground: false, theme: "one-dark-pro" }],
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
