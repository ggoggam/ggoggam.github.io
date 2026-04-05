import { format } from "date-fns";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  published: boolean;
  tags: string[];
  type: "blog" | "til";
  url: string;
};

function extractMeta(filePath: string, mod: any, type: "blog" | "til"): PostMeta {
  const slug = filePath.match(/\/([^/]+)\.mdx$/)?.[1] ?? "";
  const fm = mod.frontmatter ?? {};
  return {
    slug,
    title: fm.title as string,
    date: format(new Date(fm.date), "yyyy-MM-dd"),
    excerpt: fm.excerpt as string,
    published: fm.published as boolean,
    tags: (fm.tags as string[]) ?? [],
    type,
    url: `/${type}/${slug}`,
  };
}

const blogModules = import.meta.glob("/content/blog/*.mdx", { eager: true });
const tilModules = import.meta.glob("/content/til/*.mdx", { eager: true });

export function getBlogPosts(): PostMeta[] {
  return Object.entries(blogModules)
    .map(([p, mod]) => extractMeta(p, mod, "blog"))
    .filter((p) => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getTILPosts(): PostMeta[] {
  return Object.entries(tilModules)
    .map(([p, mod]) => extractMeta(p, mod, "til"))
    .filter((p) => p.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getRecentPosts(): PostMeta[] {
  return [...getBlogPosts(), ...getTILPosts()]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);
}
