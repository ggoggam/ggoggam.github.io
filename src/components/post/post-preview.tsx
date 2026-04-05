import { Link } from "@tanstack/react-router";

export type PostPreviewProps = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  url: string;
  type: "til" | "blog";
};

export default function PostPreview({ slug, title, date, url }: PostPreviewProps) {
  return (
    <li key={slug} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
      <time className="text-sm text-gray-400 shrink-0 tabular-nums">{date}</time>
      <Link to={url} className="hover:text-gray-600">
        {title}
      </Link>
    </li>
  );
}
