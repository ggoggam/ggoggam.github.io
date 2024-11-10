import { getAllNotes } from '$lib/api';

export async function load({ params }) {
    const posts = await getAllNotes();
    return { posts };
};