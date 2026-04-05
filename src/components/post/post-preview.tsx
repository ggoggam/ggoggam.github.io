import { Link } from "@tanstack/react-router";

export type PostPreviewProps = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  url: string;
  type: "til" | "blog";
  onTagClick?: (tag: string) => void;
};

export default function PostPreview({
  slug,
  title,
  date,
  tags,
  url,
  onTagClick,
}: PostPreviewProps) {
  return (
    <li key={slug} className="flex flex-col gap-1">
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
        <time className="text-sm text-gray-400 shrink-0 tabular-nums">{date}</time>
        <Link to={url} className="hover:text-gray-600">
          {title}
        </Link>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:ml-[6.5rem]">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
