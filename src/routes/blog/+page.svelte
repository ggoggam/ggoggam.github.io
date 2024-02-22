<script lang="js">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import { Input } from "$lib/components/ui/input";
    import { siteConfig } from "$lib/config";

    /** @type {import('./$types').PageData} */
	export let data;

    let query = "";

    $: posts = data.posts.filter((post) => {
        if (query) {
            return post.title.includes(query) || post.preview.includes(query); 
        }
        return true;
    })
</script>

<svelte:head>
    <title>{siteConfig.name} - blog</title>
</svelte:head>

<div class="max-w-xl self-center">
    <Input type="text" placeholder="Search" class="sticky my-4" bind:value={query}/>

    {#if posts.length > 0}
        <div class="flex grow flex-col gap-y-4">
            {#each posts as post}
            <a href="/blog/{post.slug}" class="grow min-w-full">
                <Card.Root>
                    <Card.Header>
                        <Card.Title>{post.title}</Card.Title>
                        <Card.Description>{post.description}</Card.Description>
                    </Card.Header>
                    <Card.Footer>
                        <div class="flex grow justify-between items-center">
                            <p class="font-base text-sm">{post.readingTime.text}</p>
                            <div class="flex gap-x-2">
                                {#each post.categories as category}
                                    <Badge>{category}</Badge>
                                {/each}
                            </div>
                        </div>
                    </Card.Footer>
                </Card.Root>
            </a>
            {/each}
        </div>
    {:else}
        <p class="flex grow">
            No posts found {":("}
        </p>
    {/if}
</div>
