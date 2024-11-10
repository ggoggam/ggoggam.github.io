<script lang="ts">
    import PostPreview from '$lib/components/post-preview.svelte';
    import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

    let posts = $derived(data.posts)
</script>

{#each posts as post}
    <PostPreview post={post}></PostPreview>
{/each}