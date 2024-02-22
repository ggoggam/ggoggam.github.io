<script lang="js">
    import { siteConfig } from '$lib/config';
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<svelte:head>
    <title>{siteConfig.name} - {data.meta.title}</title>
    <meta name="description" content={data.meta.description} />
    <meta name="author" content={data.meta.author} />
</svelte:head>
  
<!-- render the post -->
<div class="md:max-w-2xl flex-1 flex-col md:self-center">
    <article>
        <div class="flex flex-col gap-y-4">
            <header class="flex flex-col gap-y-2">
                <h1 class="mt-6 text-4xl font-bold tracking-tight">
                {data.meta.title}
                </h1>
                <h4 class="text-base font-base flex flex-row gap-x-2">
                <p>{data.meta.date}</p>    
                <span>|</span>
                <span>{data.meta.readingTime.text}</span>
                </h4>
            </header>
            <hr/>
            <article class="prose dark:prose-invert">
                <svelte:component this={data.content} />
            </article>
        </div>
    </article>
</div>

<style lang="postcss">
    :global(.prose a) {
        text-decoration: none;
    }
</style>