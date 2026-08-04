// Isolated so Vite emits KaTeX's stylesheet as its own async CSS chunk.
// Only posts with `math: true` in frontmatter import this, which keeps ~16KB
// gzipped off the other seventeen posts.
import "katex/dist/katex.min.css";

export {};
