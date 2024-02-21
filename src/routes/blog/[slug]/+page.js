import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const { slug } = params;
    try {
        const post = await import(`../../../posts/${slug}.md`);
        return {
            content: post.default,
            meta: {
                ...post.metadata,
                slug
            }
        }
    } catch (err) {
        error(404, 'Post Not found')
    }
}