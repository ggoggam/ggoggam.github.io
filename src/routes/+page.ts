import { getAllPosts } from '$lib/api';

export async function load({ params }) {
    const posts = await getAllPosts();
    return { posts };
};