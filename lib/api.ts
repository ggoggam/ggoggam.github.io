import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { remark } from "remark";
import html from "remark-html";


const POST_DIRECTORY = join(process.cwd(), "_posts");
const NOTE_DIRECTORY = join(process.cwd(), "_notes");

export function getPostSlugs() {
    return fs.readdirSync(POST_DIRECTORY);
}

export function getNoteSlugs() {
    return fs.readdirSync(NOTE_DIRECTORY);
}

export function getPostBySlug(slug: string): Post {
    const realSlug = slug.replace(/\.md$/, "");
    const fullPath = join(POST_DIRECTORY, `${realSlug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return { ...data, link: `/learned/${realSlug}`, key: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
    const slugs = getPostSlugs();
    const posts = slugs
        .map((slug) => getPostBySlug(slug))
        .sort((p1, p2) => (p1.date > p2.date ? -1 : 1));
    return posts;
}

export function getNoteBySlug(slug: string): Post {
    const realSlug = slug.replace(/\.md$/, "");
    const fullPath = join(NOTE_DIRECTORY, `${realSlug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return { ...data, link: `/learned/${realSlug}`, key: realSlug, content } as Post;
}

export function getAllNotes(): Post[] {
    const slugs = getNoteSlugs();
    const notes = slugs
        .map((slug) => getNoteBySlug(slug))
        .sort((p1, p2) => (p1.date > p2.date ? -1 : 1));
    return notes;
}


export default async function markdownToHtml(markdown: string) {
    const result = await remark().use(html).process(markdown);
    return result.toString();
  }