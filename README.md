## ggoggam.github.io

Personal blog built with React, TanStack Router, and Vite. Content is authored in MDX with support for math rendering (KaTeX), syntax highlighting (Shiki), and GitHub Flavored Markdown.

### Tech Stack

- **React 19** + **TypeScript**
- **TanStack Router** (file-based routing)
- **Vite 6** (build tooling)
- **Tailwind CSS** (styling)
- **MDX** with remark/rehype plugins (content)
- **Giscus** (comments via GitHub Discussions)

### Development

This project uses [`bun`](https://bun.sh) as the JavaScript runtime and package manager.

```bash
# Install dependencies
bun install

# Start dev server at localhost:3000
bun run dev

# Build for production
bun run build

# Lint and format
bun run lint:fix
bun run format
```

### Project Structure

```
src/
  routes/       File-based routes (blog, til, about, index)
  components/   React components and MDX renderers
  lib/          Utilities (content loading, image helpers)
  app/          Global styles
content/        MDX blog and TIL posts
public/         Static assets
```

### Deployment

Static site deployment to GitHub Pages is handled automatically via GitHub Actions (`.github/workflows/`).
