<script>
    import "../app.css";
    import { ModeWatcher } from "mode-watcher";
    import { Toaster } from "$lib/components/ui/sonner";
    import { SiteHeader, SiteFooter } from "$lib/components";
</script>

<Toaster expand={false} position="bottom-right" />
<ModeWatcher />

<div class="m-auto max-w-screen-xl min-h-screen justify-between relative flex flex-col bg-background" id="page">
    <SiteHeader/>

    <div class="container flex flex-col px-6 justify-center">
        <slot />
    </div>

    <SiteFooter/>
</div>