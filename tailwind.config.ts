import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      fontFamily: {
        display: "var(--font-display)",
        mono: "var(--font-mono)",
        body: "var(--font-body)",
      },
      fontSize: {
        "2xs": "var(--text-2xs)",
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lede: "var(--text-lede)",
        h3: "var(--text-h3)",
        h2: "var(--text-h2)",
        title: "var(--text-title)",
        wordmark: "var(--text-wordmark)",
      },
      colors: {
        paper: "var(--paper)",
        "paper-sunk": "var(--paper-sunk)",
        ink: "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-faint": "var(--ink-faint)",
        rule: "var(--rule)",
        "rule-strong": "var(--rule-strong)",
        accent: "var(--accent)",
      },
      borderColor: {
        DEFAULT: "var(--rule)",
      },
      letterSpacing: {
        label: "var(--tracking-label)",
        title: "var(--tracking-title)",
      },
      maxWidth: {
        measure: "var(--measure)",
      },
    },
  },
  plugins: [],
} satisfies Config;
