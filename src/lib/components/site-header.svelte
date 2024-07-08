<script>
    import { Button } from "$lib/components/ui/button";
    import { default as SiteTitle } from "./site-title.svelte";
    import { siteConfig } from "$lib/config"
  	import { toast } from 'svelte-sonner';
    import { setMode, mode } from "mode-watcher";
    import { Rss, Sun, Moon, Github } from "lucide-svelte";

    const navigationItems = [
      {
        href: "/blog",
        name: "blog"
      },
      // {
      //   href: "/gallery",
      //   name: "gallery"
      // },
      {
        href: "/about",
        name: "about"
      }
    ];

    var onButtonClick = () => {
      let string;
      if ($mode == 'light') {
        setMode("dark");
        string = "Dark Mode On 🌜";
      } else {
        setMode("light");
        string = "Dark Mode Off 🌞";
      };
      toast(string, { dismissable: true, duration: 1500 });
    };
</script>

<header>
    <nav>
        <div class="m-auto max-w-screen-xl flex flex-wrap items-center justify-between px-6 py-8">
          <a href="/">
            <SiteTitle siteTitle={siteConfig.name}/>
          </a>

          <ul class="flex gap-x-10 items-center lg:justify-end">
            {#each navigationItems as item}
              <a class="text-base font-semibold hover-underline-animation" href={item.href}>{item.name}</a>
            {/each}
            
            <div class="hidden lg:flex gap-x-4 items-center">
              <Button href={siteConfig.links.github} variant="outline" size="icon" >
                <Github
                  class="h-[1.2rem] w-[1.2rem]"
                />
                <span class="sr-only">Github</span>
              </Button>
    
              <Button href="/rss.xml" variant="outline" size="icon">
                <Rss
                  class="h-[1.2rem] w-[1.2rem]"
                />
                <span class="sr-only">RSS</span>
              </Button>
      
              <Button on:click={onButtonClick} variant="outline" size="icon">
                <Sun
                  class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                  class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
                <span class="sr-only">Toggle theme</span>
              </Button>
            </div>
          </ul>
        </div>
    </nav>
  </header>

  <style>
    .hover-underline-animation {
      text-decoration: none;
      padding: 4px 0px;
      display: inline-block;
      position: relative;
    }
    
    .hover-underline-animation:after {    
      background: none repeat scroll 0 0 transparent;
      bottom: 0;
      content: "";
      display: block;
      height: 1px;
      left: 50%;
      position: absolute;
      background: hsl(var(--foreground));
      transition: width 0.3s ease 0s, left 0.3s ease 0s;
      width: 0;
    }

    .hover-underline-animation:hover:after { 
      width: 100%; 
      left: 0; 
    }
  </style>