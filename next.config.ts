import createMdx from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import { transformerCopyButton } from '@rehype-pretty/transformers'

const isProd = process.env.NODE_ENV === 'production';
const repoName = process.env.NEXT_PUBLIC_REPO_NAME || '';

/** @type {import('rehype-pretty-code').Options} */
const prettyCodeOptions = {
  keepBackground: false,
  theme: 'one-dark-pro',
  transformers: [
    transformerCopyButton({
      visibility: 'always',
      feedbackDuration: 2500,
    })
  ]
}


const withMDX = createMdx({
  options: {
    remarkPlugins: [remarkMath, remarkGfm],
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions], rehypeKatex],
  },  
})

/** @type {import('next').NextConfig} */
const nextConfig = withMDX({
  publicRuntimeConfig: {
    basePath: isProd && repoName ? `/${repoName}` : '',
  },
  basePath: isProd && repoName ? `/${repoName}` : '',
  assetPrefix: isProd && repoName ? `/${repoName}/` : '',
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
})

export default nextConfig
