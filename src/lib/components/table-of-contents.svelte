<script>
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import * as Card from "$lib/components/ui/card";
  
    export let post;
  
    let elements = [];
    let headings = post.headings;
  
    onMount(() => {
      updateHeadings()
      setActiveHeading()
    })
  
    let activeHeading = headings[0];
    let scrollY;
  
    const updateHeadings = () => {
      headings = post.headings
  
      if (browser) {
        elements = headings.map((heading) => {
          return document.getElementById(heading.id)
        })
      }
    }
    
    const setActiveHeading = () => {
      scrollY = window.scrollY
  
      let visibleIndex = elements.findIndex((element) => element.offsetTop + element.clientHeight > scrollY);
      if (visibleIndex < 0) {
        visibleIndex = 0
      }
      activeHeading = headings[visibleIndex]
  
      const pageHeight = document.body.scrollHeight
      const scrollProgress = (scrollY + window.innerHeight) / pageHeight
  
      if (!activeHeading) {
        if (scrollProgress > 0.5) {
          activeHeading = headings[headings.length - 1]
        } else {
          activeHeading = headings[0]
        }
      }
    }
</script>
  
<svelte:window on:scroll={setActiveHeading} />

<Card.Root>
  <Card.Header>
    <Card.Title>Table of Contents</Card.Title>
  </Card.Header>
  <Card.Content>
      <ul class="flex flex-col gap-y-2">
          {#each headings as heading}
          <li
              class="transition-colors heading text-muted-foreground hover:text-foreground"
              class:active={activeHeading === heading}
              style={`--depth: ${Math.max(0, heading.depth - 1)}`}
          >
              <a class="text-wrap" href={`#${heading.id}`}>{activeHeading == heading ? '>' : ''} {heading.value}</a>
          </li>
          {/each}
      </ul>
  </Card.Content>
</Card.Root>


<style lang="postcss">
  .heading {
    padding-left: calc(var(--depth, 0) * 0.5rem);
  }
  
  .active {
    @apply font-medium text-foreground -ml-[2px];
  }
</style>