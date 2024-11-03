import { Author } from "@/interfaces/author";
import Link from "next/link";
import Date from "./date";
import Avatar from "./avatar";

type PostPreviewProps = {
    key: string;
    link: string;
    title: string;
    date: string;
    excerpt: string;
    author: Author;
}


export default function PostPreview({
    key,
    link,
    title,
    date,
    excerpt,
    author
 }: PostPreviewProps) {
    return (
        <section className="flex flex-col gap-y-4">
            <h3 className="text-3xl leading-snug">
                <Link href={link} className="hover:underline">{title}</Link>
            </h3>
            <div className="text-lg mb-4">
                <Date date={date}></Date>
            </div>
            <p className="text-lg leading-relaxed">{excerpt}</p>
            <Avatar name={author.name} image={author.image} />
        </section>

    );
}
