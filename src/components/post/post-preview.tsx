import { Link } from "@tanstack/react-router";

export type PostPreviewProps = {
  title: string;
  date: string;
  url: string;
  type: "til" | "blog";
  showType?: boolean;
  headingLevel?: 2 | 3;
};

export default function PostPreview({
  title,
  date,
  url,
  type,
  showType = false,
  headingLevel = 3,
}: PostPreviewProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <li className="post-row">
      <Link to={url} className="post-row-link">
        <time className="post-date" dateTime={date}>
          {date}
        </time>
        <Heading className="post-title">{title}</Heading>
        {showType && <span className="post-kind">{type}</span>}
      </Link>
    </li>
  );
}
