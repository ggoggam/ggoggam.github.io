import Link from "next/link"

export type PostPreviewHomeProps = {
    slug: string,
    title: string,
    date: string,
    excerpt: string,
    url: string,
    type: 'til' | 'blog'
}

export default function PostPreviewHome({ slug, title, date, excerpt, url, type }: PostPreviewHomeProps) {
    return (
        <div key={slug} className="bg-white p-6 rounded-lg shadow-sm justify-between">
            <div>
                <h3 className="text-xl font-black mb-2">
                    <Link href={url} className="hover:underline">
                        {title.toUpperCase()}
                    </Link>
                </h3>
                <p className="text-gray-400 mb-2">{date}</p>
                <p className="text-gray-500 line-clamp-2">{excerpt}</p>
            </div>
            <p className="mt-2 font-semibold text-sm text-right text-gray-400">{type === 'til' ? 'TIL' : 'BLOG'}</p>
        </div>
    )
}