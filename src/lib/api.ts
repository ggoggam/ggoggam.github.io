import type { Post } from "./interface/post";

export const getAllPosts = async () => {
    const files = import.meta.glob(`/src/_posts/*.md`, {eager: true});

    const promises = Object.entries(files).map(([path, post]) => {
        const slug = path.replace(/(\/index)?\.md/, '').split('/').pop()
        
        let link = `/learned/${slug}`;
        if (post.metadata.note != true) {
            link = `/thought/${slug}`;
        }

        return {
            ...post.metadata,
            link: link,
            slug: slug,
            categories: post.metadata.categories ? post.metadata.categories.sort() : [],
        }
    });
    const posts: Post[] = await Promise.all(promises);

    return posts
        .filter((post) => post.published)
        .sort((a,b) => (new Date(a.date) > new Date(b.date) ? -1 : 1))
};

export const getAllBlogs = async () => {
    const posts = await getAllPosts();
    return posts.filter((post) => post.note != true)
}

export const getAllNotes = async () => {
    const posts = await getAllPosts();
    return posts.filter((post) => post.note)
}