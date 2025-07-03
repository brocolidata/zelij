<script lang="ts">
	import "../app.css";
	// import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	// import AppSidebar from "$custom_ui/app_sidebar.svelte";
	import SiteHeader from "$custom_ui/app_header.svelte";
	import { ModeWatcher } from "mode-watcher";
	import { onMount } from "svelte";
	import { loadData } from "$lib/zelij_utils/duckdb";
	import { DoubleBounce } from "svelte-loading-spinners";
	import {
		initializeAppStores,
		dataLoaded,
		updateDataSourcesWithColumnTypes,
	} from "$lib/zelij_utils/stores";
	import { loadConfig } from "$lib/zelij_utils/zelij_config";
	import { Toaster, toast } from "svelte-sonner";
	import { Label } from "$lib/components/ui/label/index.js";

	let { children } = $props();
	let appReady = $state(false);
	let error: Error | null = $state(null);

	onMount(async () => {
		try {
			await loadConfig();
			initializeAppStores();
			appReady = true;
			toast.loading("Loading data...");
			await loadData();
			console.log("Successfully ingested data");
			await updateDataSourcesWithColumnTypes();
			dataLoaded.set(true);
			toast.success("Data is ready for analysis");
		} catch (e) {
			error = e as Error;
			console.error("Initialization failed:", e); // Use a more general error message for the whole block
			toast.error("Failed to initialize application data"); // General error toast
		}
	});
</script>

<Toaster />
{#if !appReady && !error}
	<!-- loading screen -->
	<div
		class="flex flex-col items-center justify-center h-screen w-screen space-y-3 bg-gray-500"
	>
		<Label class="text-sky-200">App is Loading...</Label>
		<DoubleBounce size="60" color="#FF3E00" />
	</div>
{:else if error}
	<div class="p-4 text-red-600 font-semibold">
		Something went wrong: {error.message}
	</div>
{:else}
	
	<ModeWatcher />
	<div class="min-h-screen flex flex-col">
		<SiteHeader />

		<main class="grow flex flex-col overflow-hidden">
			<div class="w-full h-full" id="page">
				{@render children?.()}
			</div>
		</main>
	</div>
{/if}
