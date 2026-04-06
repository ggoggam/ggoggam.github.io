import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Geist Mono", "monospace"],
        "geist-mono": ["Geist Mono", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
