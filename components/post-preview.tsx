import { Post } from "@/interfaces/post";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
    post: Post
}


export default function PostPreview({ post }: Props) {
    if (!post) {
        return notFound();
    }

    return (
        <section>
            <Link 
                href={post.link}
                className="text-2xl font-semibold tracking-tighter leading-tight">
            {post.title}
            </Link>
        </section>

    );
}
