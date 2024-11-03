import { Author } from "./author";

export type Post = {
  key: string;
  title: string;
  date: string;
  link: string;
  coverImage: string;
  excerpt: string;
  content: string;
  preview?: boolean;
  author: Author;
};