import PostPreview from "./post-preview";
import type { PostMeta } from "@/lib/posts";

export type PostListProps = {
  posts: PostMeta[];
  selectedTag: string | undefined;
  onTagChange: (tag: string | undefined) => void;
};

export default function PostList({ posts, selectedTag, onTagChange }: PostListProps) {
  const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();
  const filtered = selectedTag ? posts.filter((p) => p.tags.includes(selectedTag)) : posts;

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagChange(selectedTag === tag ? undefined : tag)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                selectedTag === tag
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <ul className="space-y-4">
        {filtered.map((post) => (
          <PostPreview
            key={post.slug}
            {...post}
            onTagClick={(tag) => onTagChange(selectedTag === tag ? undefined : tag)}
          />
        ))}
      </ul>
    </div>
  );
}
