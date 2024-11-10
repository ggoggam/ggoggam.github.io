<script lang="ts">
    import type { Post } from "$lib/interface/post";
    let { post }: { post: Post } = $props();
</script>

<a href={post.link}>
    <h2 class="text-4xl font-black">{post.title}</h2>
    <p>{post.preview}</p>
    <p>{post.author.name}</p>
</a>
