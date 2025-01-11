import PostPreview, { PostPreviewProps } from "./post-preview"

export type PostListProps = {
    posts: PostPreviewProps[]
}

export default function PostList({ posts }: PostListProps) {
    return (
        <div className='mx-auto space-y-4 max-w-2xl py-4 md:py-8'>
        {posts.map((post) => (
            <PostPreview key={post.slug} {...post} />
        ))}
        </div>
    )
}