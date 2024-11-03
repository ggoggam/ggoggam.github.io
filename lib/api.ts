import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const POST_DIRECTORY = join(process.cwd(), "_posts");

function getPostIds() {
    return fs.readdirSync(POST_DIRECTORY).filter(fn => fn.endsWith(".md"))
};

export function getAllPosts() {
    const ids = getPostIds();
    return ids
        .map(id => getPostById(id))
        .sort((p1, p2) => (p1.date > p2.date ? -1 : 1));
};

export function getPostById(id: string): Post {
    const realId = id.replace(/\.md$/, "");
    const fullPath = join(POST_DIRECTORY, `${realId}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    return { ...data, link: `/learned/${realId}`, key: realId, content } as Post;
};
