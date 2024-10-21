export type Post = {
  key: string;
  title: string;
  date: string;
  link: string;
  coverImage: string;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;
  preview?: boolean;
};