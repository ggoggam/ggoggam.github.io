import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Geist Mono", "monospace"],
        "geist-mono": ["Geist Mono", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            "code, pre code": {
              fontFamily: '"Geist Mono", monospace',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
