import Link from "next/link"

export type PostPreviewProps = {
    slug: string,
    title: string,
    date: string,
    excerpt: string,
    url: string,
    type: 'til' | 'blog'
}

export default function PostPreview({ slug, title, date, excerpt, url, type }: PostPreviewProps) {
    return (
        <div key={slug} className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-black mb-2">
            <Link href={url} className="hover:underline">
                {title.toUpperCase()}
            </Link>
        </h3>
            <p className="text-gray-400 mb-2">{date}</p>
            <p className="text-gray-500 line-clamp-2">{excerpt}</p>
        </div>
    )
}