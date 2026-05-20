/* global console */
import fs from "fs";
import path from "path";
import yaml from "yaml";

const SITE_URL = "https://ggoggam.github.io";
const SITE_NAME = "꼬깜";
const DIST = "dist";

function escapeAttr(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf-8");

function createPage(routePath, { title, description, type = "website" }) {
  const fullTitle = routePath === "/" ? SITE_NAME : `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${routePath}`;

  const metaTags = [
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `<link rel="canonical" href="${url}" />`,
  ].join("\n    ");

  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${escapeAttr(fullTitle)}</title>`)
    .replace("</head>", `    ${metaTags}\n  </head>`);

  const outputDir = routePath === "/" ? DIST : path.join(DIST, routePath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), html);
  console.log(`  ${routePath}`);
}

function getPosts(type) {
  const dir = path.join("content", type);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      const match = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return null;
      const data = yaml.parse(match[1]);
      if (!data.published) return null;
      return {
        slug: f.replace(".mdx", ""),
        title: data.title ?? "",
        excerpt: data.excerpt ?? "",
        date: data.date,
      };
    })
    .filter(Boolean);
}

function formatDate(date) {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
}

// --- Generate static pages ---

console.log("Generating static pages...");

const blogPosts = getPosts("blog");
const tilPosts = getPosts("til");

createPage("/", {
  title: SITE_NAME,
  description: "A blog about software engineering, machine learning, and more.",
});

createPage("/about", {
  title: "About",
  description: "About 꼬깜 — software engineer and cat enthusiast.",
});

createPage("/blog", {
  title: "Blog",
  description: "Blog posts about software engineering, machine learning, and more.",
});

createPage("/til", {
  title: "TIL",
  description: "Today I Learned — short notes and discoveries.",
});

for (const post of blogPosts) {
  createPage(`/blog/${post.slug}`, {
    title: post.title,
    description: post.excerpt,
    type: "article",
  });
}

for (const post of tilPosts) {
  createPage(`/til/${post.slug}`, {
    title: post.title,
    description: post.excerpt,
    type: "article",
  });
}

// --- Generate sitemap.xml ---

console.log("Generating sitemap.xml...");

const urls = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/about", priority: "0.5", changefreq: "monthly" },
  { loc: "/blog", priority: "0.8", changefreq: "weekly" },
  { loc: "/til", priority: "0.8", changefreq: "weekly" },
  ...blogPosts.map((p) => ({
    loc: `/blog/${p.slug}`,
    lastmod: formatDate(p.date),
    priority: "0.6",
    changefreq: "monthly",
  })),
  ...tilPosts.map((p) => ({
    loc: `/til/${p.slug}`,
    lastmod: formatDate(p.date),
    priority: "0.6",
    changefreq: "monthly",
  })),
];

const today = new Date().toISOString().split("T")[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod ?? today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);
console.log("  sitemap.xml");

console.log(`Done. ${urls.length} pages + sitemap generated.`);
