import type { Author } from "./author";

export type Post = {
    slug: string;
    published: boolean;
    note?: boolean;
    title: string;
    author: Author;
    date: string;
    link: string;
    preview: string;
    content: string;
    categories: string[];
};