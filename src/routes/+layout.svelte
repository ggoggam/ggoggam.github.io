<script>
    import "../app.css";
    import { ArrowUpRight } from "lucide-svelte";

	let { children } = $props();
</script>

<div class="flex flex-col min-h-screen md:screen-width-xl justify-center items-center">
    <header class="container py-2 md:py-12 px-2 md:px8">
        <nav class="flex justify-between items-center flex-wrap">
            <a href="/" class="font-black text-4xl md:text-6xl leading-tight tracking-tighter">
                TODAY I
            </a>
            <ul class="flex space-x-8 text-md md:text-lg font-black">
                <li>
                    <a href="/learned">LEARNED</a>
                </li>
                <li>
                    <a href="/thought">THOUGHT</a>
                </li>
            </ul>
        </nav>
    </header>
    <main class="container">
       {@render children()}
    </main>
    <footer class="container mt-4 space-y-8 text-neutral-600 px-2 md:px-8">
        <ul class="text-xs md:text-sm hover:text-neutral-800 flex flex-row space-x-4">
            <li>
                <a href="/about" class="flex items-center transition-all gap-x-1" rel="noreferrer noopener">
                    <ArrowUpRight />
                    about
                </a>
            </li>
            <li>
                <a href="/rss.xml" class="flex items-center transition-all gap-x-1" rel="noreferrer noopener">
                    <ArrowUpRight />
                    rss
                </a>
            </li>
            <li>
                <a href="https://github.com/ggoggam" class="flex items-center transition-all gap-x-1" rel="noreferrer noopener">
                    <ArrowUpRight />
                    github
                </a>
            </li>
            <li>
                <a href="https://github.com/ggoggam/ggoggam.github.io" class="flex items-center transition-all gap-x-1" rel="noreferrer noopener">
                    <ArrowUpRight />
                    source
                </a>
            </li>
        </ul>

    </footer>
</div>


