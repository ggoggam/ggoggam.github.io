import PostList from '@/components/post/post-list'
import { getBlogPosts } from '@/lib/posts'

export default async function BlogPage() {
  const posts = await getBlogPosts()
  return <PostList posts={posts} />
}

