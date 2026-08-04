import type { MDXComponents } from "mdx/types";
import { useState } from "react";

function CopyLinkButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Link copied" : "Copy link to this section"}
      className="ml-2 inline-flex size-6 shrink-0 translate-y-[0.1em] items-center justify-center align-middle text-ink-faint opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  );
}

/** Headings share one shape: display face, anchored, with a hover-revealed copy link. */
function heading(Tag: "h1" | "h2" | "h3", className: string) {
  return function Heading({ id, children, ...props }: React.ComponentProps<typeof Tag>) {
    return (
      <Tag id={id} className={`title-display group scroll-mt-8 ${className}`} {...props}>
        {id ? (
          <a href={`#${id}`} className="no-underline hover:underline">
            {children}
          </a>
        ) : (
          children
        )}
        {id && <CopyLinkButton id={id} />}
      </Tag>
    );
  };
}

export const mdxComponents: MDXComponents = {
  // More space above a heading than below it, so sections read as grouped.
  h1: heading("h1", "text-h2 mt-14 mb-4"),
  h2: ({ id, children, ...props }) => {
    const H = heading("h2", id === "footnote-label" ? "text-h3 mt-14 mb-4" : "text-h2 mt-14 mb-4");
    return (
      <H id={id} {...props}>
        {children}
      </H>
    );
  },
  h3: heading("h3", "text-h3 mt-10 mb-3"),
  p: (props) => <p className="my-5 leading-[1.72]" {...props} />,
  ul: (props) => (
    <ul className="my-5 list-disc space-y-1.5 pl-5 marker:text-ink-faint" {...props} />
  ),
  ol: (props) => (
    <ol className="my-5 list-decimal space-y-1.5 pl-5 marker:text-ink-faint" {...props} />
  ),
  li: (props) => <li className="leading-[1.72] pl-1" {...props} />,
  a: ({ href, children, ...props }) => {
    const isInternal = href?.startsWith("/") || href?.startsWith("#");
    if (isInternal) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  img: ({ src, alt, ...props }) => <img src={src} alt={alt || ""} loading="lazy" {...props} />,
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left" {...props}>
        {children}
      </table>
    </div>
  ),
  section: ({ children, ...props }) => <section {...props}>{children}</section>,
};
