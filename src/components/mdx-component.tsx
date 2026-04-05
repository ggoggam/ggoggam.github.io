import type { MDXComponents } from "mdx/types";
import { Link } from "@tanstack/react-router";

export const mdxComponents: MDXComponents = {
  h1: (props) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-xl font-bold mt-8 mb-3" {...props} />,
  h3: (props) => <h3 className="text-lg font-bold mt-6 mb-2" {...props} />,
  p: (props) => <p className="leading-relaxed my-4" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-4" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
  li: (props) => <li className="my-1" {...props} />,
  a: ({ href, children, ...props }) => {
    const isInternal = href?.startsWith("/");
    if (isInternal) {
      return (
        <Link to={href as string} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  img: ({ src, alt, ...props }) => (
    <img src={src} alt={alt || ""} loading="lazy" className="my-4 max-w-full rounded" {...props} />
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
          <h3 className="text-lg font-bold my-4">Footnotes</h3>
          {children}
        </section>
      );
    }
    return <section {...props}>{children}</section>;
  },
};
