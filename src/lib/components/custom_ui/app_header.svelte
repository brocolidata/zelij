<script lang="ts">
	import { base } from '$app/paths';
	import { Button } from "$lib/components/ui/button/index.js";
    import {Sun, Moon} from "@lucide/svelte";
	import { toggleMode } from "mode-watcher";
	// import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	import AppLogo from './app_logo.svelte';

	let logoIsHoveredOn = $state(false);
</script>

<header
	class="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div class="container flex h-14 max-w-screen-2xl items-center justify-between">
		<!-- Left-aligned elements -->
		<div class="mr-4 hidden md:flex pl-4">
			<!-- <Sidebar.Trigger /> -->
			
			<a 
				href="{base}/" 
				class="mr-6 flex items-center space-x-2"
				onmouseenter={() => logoIsHoveredOn = true}
				onmouseleave={() => logoIsHoveredOn = false}
			>
				<!-- <img src="/zelij_logo.svg" alt="App Logo" style="width: 38px; height: 38px;" /> -->
				<AppLogo isHoveredOn={logoIsHoveredOn} />
				<span class=" font-bold xl:inline-block dark:text-white">
					<!-- {siteConfig.name} -->
					Zelij
				</span>
			</a>
			<nav class="flex items-center gap-6 text-sm">
				<a
					href="{base}/creation"
					class="hover:text-foreground/80 transition-colors"
				>
					Creation
				</a>
			</nav>
		</div>

		<!-- Right-aligned ModeWatcher -->
		<div class="pr-4">
			<Button onclick={toggleMode} variant="outline" size="icon" class="justify-center">
                <Sun
                  class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                  class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
                <span class="sr-only">Toggle theme</span>
            </Button>
		</div>
	</div>
</header>