<script lang="js">
    import { Separator } from "$lib/components/ui/separator"

    /** @type {import('./$types').PageData} */
    export let data;
</script>

<svelte:head>
    <title>{data.meta.title} - {data.meta.author}</title>
    <meta name="description" content={data.meta.preview.text} />
    <meta name="author" content={data.meta.author} />
</svelte:head>
  
<!-- render the post -->
<div class="container flex-1 md:grid md:gap-6 justify-center mx-auto">
    <article class="min-w-fit">
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
            <Separator></Separator>
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