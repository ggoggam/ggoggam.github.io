export async function getPosts() {
    const modules = import.meta.glob(`/src/posts/*.{md,svx,svelte.md}`, {eager: true});

	const postPromises = Object.entries(modules).map(([path, post]) => {
        return {
            ...post.metadata,
            slug: path
                .replace(/(\/index)?\.md/, '')
                .split('/')
                .pop(),
            categories: post.metadata.categories ? post.metadata.categories.sort() : [],
        }
    });

    const posts = await Promise.all(postPromises);
	const publishedPosts = posts.filter((post) => post.published);
    publishedPosts.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
    
    return publishedPosts;
}
