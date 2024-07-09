<script>
    import { siteConfig } from "$lib/config"
</script>

<svelte:head>
    <title>{siteConfig.name} - about</title>
</svelte:head>

<div class="max-w-2xl self-center">
    <div class="flex flex-col gap-y-6">
        <h1 class="text-2xl font-semibold flex flex-grow">
            About Me
        </h1>
        <p class="leading-relaxed text-base text-wrap">
            I am a self-learner with interests ranging from user interface / experience, backend, to artificial intelligence. 
            Here, I am sharing my insights from my past-time tinkerings and readings. 
            My current engineering interest is in <a href="https://svelte.dev" class="underline">Svelte</a>, <a href="https://htmx.org" class="underline">HTMX</a> (hypermedia systems) and <a href="https://kotlinlang.org/docs/multiplatform.html" class="underline">Kotlin Multiplatform</a> development with Compose.
        </p>
        <p class="leading-relaxed text-base text-wrap">
            I occassionally research on topics in artificial intelligence (that is not necessarily related to large language models).
            I am currently based in Seoul, Korea with my black cat named ggoggam. 
            You can contact me via <a href="https://www.github.com/ggoggam" class="underline">Github</a>.
        </p>
    </div>
</div>
