import { Link } from "@tanstack/react-router";

export type PostPreviewProps = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  url: string;
  type: "til" | "blog";
};

export default function PostPreview({ title, date, excerpt, url }: PostPreviewProps) {
  return (
    <li className="border-b border-rule">
      <div className="flex flex-col gap-1.5 py-5 sm:flex-row sm:gap-6">
        <time className="label shrink-0 pt-[0.3em] sm:w-[6.5rem]" dateTime={date}>
          {date}
        </time>
        <div className="min-w-0 flex-1">
          <Link
            to={url}
            className="title-display block text-h3 no-underline decoration-rule-strong hover:underline"
          >
            {title}
          </Link>
          {/* The excerpt tells a stranger what the post is. The tag index above
              already does the sorting, so rows no longer repeat it. */}
          {excerpt && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{excerpt}</p>}
        </div>
      </div>
    </li>
  );
}
