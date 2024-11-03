import { getAllPosts } from "@/lib/api";
import Giscus from "@giscus/react";

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => { slug: post.key })
}


export default function NotePage() {
    return (
        <div className="mx-4">
            <div className="comments-container">
                <Giscus
                    id="comments"
                    repo="ggoggam/ggoggam.github.io"
                    repoId="R_kgDOKvkuXQ"
                    category="General"
                    categoryId="DIC_kwDOKvkuXc4Cjadh"
                    mapping="pathname"
                    reactionsEnabled="1"
                    emitMetadata="0"
                    inputPosition="bottom"
                    theme="light_high_contrast"
                    loading="lazy"
                />
            </div>
        </div>   
    )
}