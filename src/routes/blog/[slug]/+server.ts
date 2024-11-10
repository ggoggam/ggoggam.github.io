import { redirect } from '@sveltejs/kit';

export const load = ({ params }) => {
    const slug = params.slug;
    redirect(302, `/thought/${slug}`);
};