import { getTILPosts } from '@/lib/posts'
import PostPreview from '@/components/post/post-preview'
import PostList from '@/components/post/post-list'

export default async function TILPage() {
  const posts = await getTILPosts()
  return <PostList posts={posts} />
}

