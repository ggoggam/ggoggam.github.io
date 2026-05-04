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
      aria-label="Copy link to heading"
      className="ml-2 text-gray-400 hover:text-gray-600 align-middle"
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  );
}

export const mdxComponents: MDXComponents = {
  h1: ({ id, children, ...props }) => (
    <h1 id={id} className="text-2xl font-bold mt-8 mb-4" {...props}>
      {id ? (
        <a href={`#${id}`} className="hover:underline">
          {children}
        </a>
      ) : (
        children
      )}
      {id && <CopyLinkButton id={id} />}
    </h1>
  ),
  h2: ({ id, children, ...props }) => {
    if (id === "footnote-label") {
      const { className: _, ...rest } = props;
      return (
        <h2 id={id} className="text-lg font-bold my-4" {...rest}>
          <a href={`#${id}`} className="hover:underline">
            {children}
          </a>
          <CopyLinkButton id={id} />
        </h2>
      );
    }
    return (
      <h2 id={id} className="text-xl font-bold my-4" {...props}>
        {id ? (
          <a href={`#${id}`} className="hover:underline">
            {children}
          </a>
        ) : (
          children
        )}
        {id && <CopyLinkButton id={id} />}
      </h2>
    );
  },
  h3: ({ id, children, ...props }) => (
    <h3 id={id} className="text-lg font-bold mt-6 mb-2" {...props}>
      {id ? (
        <a href={`#${id}`} className="hover:underline">
          {children}
        </a>
      ) : (
        children
      )}
      {id && <CopyLinkButton id={id} />}
    </h3>
  ),
  p: (props) => <p className="leading-relaxed my-4" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-4" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
  li: (props) => <li className="my-1" {...props} />,
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
  img: ({ src, alt, ...props }) => (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className="my-4 max-w-full rounded-md"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote className="border-l-2 border-gray-200 pl-4 italic my-4 text-gray-600" {...props} />
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full divide-y divide-gray-200" {...props}>
        {children}
      </table>
    </div>
  ),
  th: (props) => (
    <th
      className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      {...props}
    />
  ),
  td: (props) => <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600" {...props} />,
  section: ({ children, ...props }) => {
    const isFootnotes = (props as Record<string, unknown>)["data-footnotes"] !== undefined;
    if (isFootnotes) {
      return (
        <section {...props}>
          <hr className="border-gray-200" />
          {children}
        </section>
      );
    }
    return <section {...props}>{children}</section>;
  },
};
