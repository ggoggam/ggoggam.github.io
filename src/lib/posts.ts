import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import { CustomMDXComponents } from '@/components/mdx-component';
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { format } from 'date-fns'
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeAutoLinkHeadings from 'rehype-autolink-headings';

const contentDirectory = path.join(process.cwd(), 'content')
const tilDirectory = path.join(contentDirectory, 'til')
const blogDirectory = path.join(contentDirectory, 'blog')

// Ensure content directories exist
function ensureDirectoriesExist() {
  [contentDirectory, tilDirectory, blogDirectory].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

ensureDirectoriesExist()

// Render a post from its file contents
export async function renderPost(fileContents: string) {
  const { content, data } = matter(fileContents)
  const prettyCodeOptions = {
    keepBackground: false,
    theme: 'one-dark-pro',
  }
  const { frontmatter, content: compiledContent } = await compileMDX({
    source: content,
    options: { 
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkMath, remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutoLinkHeadings, { behavior: 'wrap', properties: { className: 'anchor' } }],
          [rehypePrettyCode, prettyCodeOptions],
          rehypeKatex
        ],
      },
    },
    components: CustomMDXComponents({}),
  })

  return {
    frontmatter,
    content: compiledContent,
  }
}

// Get recent posts for the home page
export async function getRecentPosts() {
  const tilPosts = await getTILPosts()
  const blogPosts = await getBlogPosts()
  
  return [...tilPosts, ...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)
}

// Get multiple posts for preview
async function getPostsFromDirectory(directory: string, type: 'til' | 'blog') {
  if (!fs.existsSync(directory)) {
    return []
  }

  const fileNames = fs.readdirSync(directory)
  const allPostsData = await Promise.all(
    fileNames.map(async (fileName) => {
      const slug = fileName.replace(/\.mdx$/, '')
      const fullPath = path.join(directory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { content, data } = matter(fileContents)

      return {
        slug,
        published: data.published as boolean,
        title: data.title as string,
        date: format(data.date, 'yyyy-MM-dd'),
        excerpt: data.excerpt as string,
        type,
        url: `/${type}/${slug}`,
      }
    })
  )

  return allPostsData.filter(a => a.published).sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getTILPosts() {
  return getPostsFromDirectory(tilDirectory, 'til')
}

export async function getBlogPosts() {
  return getPostsFromDirectory(blogDirectory, 'blog')
}

// Get a single post by slug
async function getPostFromDirectory(directory: string, slug: string) {
  const fullPath = path.join(directory, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) {
    return null
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { content, data } = matter(fileContents)
  const { frontmatter, content: compiledContent } = await renderPost(fileContents)

  return {
    slug,
    title: data.title as string,
    date: format(data.date, 'yyyy-MM-dd'),
    content: compiledContent
  }
}

export async function getTILPost(slug: string) {
  return getPostFromDirectory(tilDirectory, slug)
}


export async function getBlogPost(slug: string) {
  return getPostFromDirectory(blogDirectory, slug)
}

