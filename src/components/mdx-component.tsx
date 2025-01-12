import type { MDXComponents } from 'mdx/types'
import Image from 'next/image'
import Link from 'next/link'


export function CustomMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // only add font classes here
    h1: (props) => <h1 className="text-3xl font-bold my-2 group hover:underline" {...props} />,
    h2: (props) => <h2 className="text-2xl font-bold my-2 group hover:underline" {...props} />,
    h3: (props) => <h3 className="text-xl font-bold my-2 group hover:underline" {...props} />,
    p: ({ children }) => <p className="leading-relaxed my-4">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 my-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 my-2">{children}</ol>,
    li: ({ children }) => <li className="my-1">{children}</li>,
    a: ({ href, children }) => (
      <Link href={href as string} className="hover:underline">
        {children}
      </Link>
    ),
    img: (props) => (
      <Image
        {...props}
        width={800}
        height={400}
        className="rounded-lg my-4 shadow-sm" 
        alt={props.alt || 'Blog image'}
      />
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-gray-300">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
        {children}
      </td>
    ),
    section: ({ children }) => <><hr></hr><h3 className='text-lg font-bold my-4'>Footnotes</h3>{children}</>,
    ...components,
  }
}

