<script>
	import { cn } from "$lib/utils";
	let className = undefined;
	export let tag = "h3";
	export { className as class };
</script>

<svelte:element
	this={tag}
	class={cn("font-semibold tracking-tight", className)}
	{...$$restProps}
>
	<slot />
</svelte:element>
