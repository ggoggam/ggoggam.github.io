import { getRecentPosts } from '@/lib/posts'
import PostPreview from '@/components/post/post-preview-home'

export default async function Home() {
  const recentPosts = await getRecentPosts()
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 relative z-20" style={{ mixBlendMode: 'normal' }}>
        {recentPosts.map((post) => (
          <PostPreview key={post.slug} {...post} />
        ))}
      </div>
    </>
  )
}

