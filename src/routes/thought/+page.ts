import { getAllBlogs } from '$lib/api';

export async function load({ params }) {
    const posts = await getAllBlogs();
    return { posts };
};