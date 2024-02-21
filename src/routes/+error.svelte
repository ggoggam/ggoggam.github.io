<!-- This page handles any error encountered by the site. -->
<script>
    import { page } from '$app/stores';
    import { Button } from '$lib/components/ui/button'
	import { toast } from 'svelte-sonner';
    import { goto, afterNavigate } from "$app/navigation";
    import { base } from '$app/paths'

    let previousPage = base ;

    afterNavigate(({from}) => {
        previousPage = from?.url.pathname || previousPage
    })
</script>

<div class="flex flex-col items-center justify-center gap-y-6">
    <h1 class="font-black text-8xl text-center">{$page.status}</h1>
    <p class="font-semibold text-lg text-center">
        {$page?.error?.message ?? ""}
    </p>

    <Button on:click={() => {
        goto(previousPage == "" ? "/" : previousPage);
        toast("Moved Back ⏪");
    }}>
        <p class="font-semibold">
            Move Back
        </p>
    </Button>
</div>
