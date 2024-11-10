<script lang="ts">
	import PostPreview from '$lib/components/post-preview.svelte';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

    let recent = $derived(data.posts.slice(0,5));

    let margin = 0.15;
    let gap = 15;
    let width = $state(300);
    let height = $state(300);

    let canvas: HTMLCanvasElement | null;
    let context: CanvasRenderingContext2D | null;

    const draw = (context: CanvasRenderingContext2D | null) => {
        const marginSize = (width + height) * 0.5 * margin;

        const columns = Math.floor((width - marginSize * 2) / gap);
        const rows = Math.floor((height - marginSize * 2) / gap);
        
        // background
        context.fillStyle = "black";
        context.fillRect(0, 0, width, height);
    }

    const resize = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D | null) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        draw(context);
    }


    onMount(() => {
        canvas = document.getElementById("canvas") as HTMLCanvasElement;
        context = canvas.getContext("2d");

        resize(canvas, context);
    })  
</script>

<div class="items-center justify-center">
    <canvas id="canvas" height={height} width={width} bind:this={canvas}>
    </canvas>
</div>
<h2 class="text-5xl font-black ">Featured</h2>
{#each recent as post}
    <PostPreview post={post}></PostPreview>
{/each}
