import type { Author } from "./author";

export type Post = {
    slug: string;
    title: string;
    author: Author;
    date: string;
    link: string;
    content: string;
};