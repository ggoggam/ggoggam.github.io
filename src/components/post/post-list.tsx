import PostPreview, { PostPreviewProps } from "./post-preview";

export type PostListProps = {
  posts: PostPreviewProps[];
};

export default function PostList({ posts }: PostListProps) {
  return (
    <ul className="space-y-4">
      {posts.map((post) => (
        <PostPreview key={post.slug} {...post} />
      ))}
    </ul>
  );
}
