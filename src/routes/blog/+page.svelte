<script lang="js">
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import { siteConfig } from "$lib/config";

    /** @type {import('./$types').PageData} */
	export let data;

    let query = "";

    $: posts = data.posts.filter((post) => {
        if (query) {
            return post.title.includes(query) || post.content.includes(query); 
        }
        return true;
    })
</script>

<svelte:head>
    <title>{siteConfig.name} - blog</title>
</svelte:head>

<div class="max-w-xl min-w-xl self-center">
    <!-- <Input type="text" placeholder="Search" class="sticky my-4" bind:value={query}/> -->

    <div class="flex flex-col gap-y-4">
        {#each posts as post}
        <a href="/blog/{post.slug}" class="grow">
            <Card.Root>
                <Card.Header>
                    <Card.Title class="line-clamp-1">{post.title}</Card.Title>
                    <Card.Description>{post.description}</Card.Description>
                </Card.Header>
                <Card.Footer class="flex flex-row justify-between items-center">
                    <p class="font-base text-sm whitespace-nowrap">{post.readingTime.text}</p>
                    <div class="hidden lg:block mx-4">
                        <div class="flex flex-wrap gap-2">
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
</div>
