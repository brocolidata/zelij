<script lang="ts">
	import { base } from "$app/paths";
	import { Button } from "$lib/components/ui/button/index.js";
	import {
		Sun,
		Moon,
		Settings,
		Plus,
		LayoutGrid,
		AppWindow,
		FolderCog,
		FileUp
	} from "@lucide/svelte";
	import { toggleMode } from "mode-watcher";
	// import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { goto } from "$app/navigation";
	import DataAppCreation from "$lib/components/custom_ui/pages/data_app_creation.svelte";
	import UploadDataSource from "./upload_data_source.svelte";
	import AppLogo from "./app_logo.svelte";
	let logoIsHoveredOn = $state(false);
	let dataAppDialogIsOpen = $state(false);
	let uploadDataSourceDialogIsOpen = $state(false);
</script>

<header
	class="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur"
>
	<div
		class="container flex h-14 max-w-screen-2xl items-center justify-between"
	>
		<!-- Left-aligned elements -->
		<div class="mr-4 md:flex pl-4">
			<!-- <Sidebar.Trigger /> -->

			<a
				href="{base}/"
				class="mr-6 flex items-center space-x-2"
				onmouseenter={() => (logoIsHoveredOn = true)}
				onmouseleave={() => (logoIsHoveredOn = false)}
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
					href="{base}/data_sources"
					class="hover:text-foreground/80 transition-colors"
				>
					Data Sources
				</a>
			</nav>
		</div>

		<!-- Right-aligned ModeWatcher -->
		<div class="pr-4">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="{buttonVariants({
						variant: 'ghost',
						// size: 'icon',
					})} bg-green-400 dark:bg-green-600 justify-center"
				>
					<Plus />
					Add
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-42">
					<DropdownMenu.Group>
						<DropdownMenu.Group>
							<DropdownMenu.Item
								onSelect={() => {
									dataAppDialogIsOpen = true;
								}}
							>
								<AppWindow />
								Data App
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={() => {
									goto(`${base}/dashboard/new`);
								}}
							>
								<LayoutGrid />
								Dashboard
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={() => {
									uploadDataSourceDialogIsOpen = true
								}}
							>
								<FileUp />
								Data Source
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					class="{buttonVariants({
						variant: 'ghost',
						size: 'icon',
					})} justify-center"
				>
					<Settings />
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-42">
					<DropdownMenu.Group>
						<DropdownMenu.Group>
							<DropdownMenu.Item onSelect={toggleMode}>
								<Sun
									class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
								/>
								<Moon
									class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
								/>
								Toggle theme
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onSelect={() => {
									goto(`${base}/assets_management`);
								}}
							>
								<FolderCog />
								Manage assets
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<DataAppCreation {dataAppDialogIsOpen} />
			<UploadDataSource {uploadDataSourceDialogIsOpen} />
		</div>
	</div>
</header>