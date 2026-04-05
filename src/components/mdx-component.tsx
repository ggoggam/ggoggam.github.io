import type { MDXComponents } from "mdx/types";
import { Link } from "@tanstack/react-router";

export const mdxComponents: MDXComponents = {
  h1: (props) => <h1 className="text-3xl font-bold my-2 hover:underline" {...props} />,
  h2: (props) => <h2 className="text-2xl font-bold my-2 hover:underline" {...props} />,
  h3: (props) => <h3 className="text-xl font-bold my-2 hover:underline" {...props} />,
  p: (props) => <p className="leading-relaxed my-4" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-4" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
  li: (props) => <li className="my-1" {...props} />,
  a: ({ href, children, ...props }) => {
    const isInternal = href?.startsWith("/");
    if (isInternal) {
      return (
        <Link
          to={href as string}
          className="underline decoration-muted-foreground/50 hover:decoration-foreground"
          {...props}
        >
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className="underline decoration-muted-foreground/50 hover:decoration-foreground"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt, ...props }) => (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className="rounded-lg my-4 shadow-sm max-w-full"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote className="border-l-4 border-border pl-4 italic my-4" {...props} />
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full divide-y divide-border" {...props}>
        {children}
      </table>
    </div>
  ),
  th: (props) => (
    <th
      className="px-3 py-3 bg-secondary text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
      {...props}
    />
  ),
  td: (props) => (
    <td className="px-3 py-4 whitespace-nowrap text-sm text-muted-foreground" {...props} />
  ),
  section: ({ children, ...props }) => {
    const isFootnotes = (props as Record<string, unknown>)["data-footnotes"] !== undefined;
    if (isFootnotes) {
      return (
        <section {...props}>
          <hr />
          <h3 className="text-lg font-bold my-4">Footnotes</h3>
          {children}
        </section>
      );
    }
    return <section {...props}>{children}</section>;
  },
};
