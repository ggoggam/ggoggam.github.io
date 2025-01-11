import { notFound } from 'next/navigation'
import { getTILPost, getTILPosts } from '@/lib/posts'
import PostArticle from '@/components/post/post-article'
import { Metadata } from 'next'

type Params = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = await getTILPost(params.slug);

  if (!post) {
    notFound()
  }
  const title = `${post.title} | TIL`
  return { title }
}

export async function generateStaticParams() {
  const posts = await getTILPosts()
  return posts.map((post) => { return { slug: post.slug } })
}

export default async function BlogPost(props: Params) {
  const params = await props.params
  const post = await getTILPost(params.slug)

  if (!post) {
    notFound()
  }

  return <PostArticle {...post}/>
}

