<script lang="ts">
  import "../app.css";
  // import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  // import AppSidebar from "$custom_ui/app_sidebar.svelte";
  import SiteHeader from "$custom_ui/app_header.svelte";
  import { ModeWatcher } from "mode-watcher";
  import { onMount } from "svelte";
  import { loadData } from "$lib/zelij_utils/duckdb";
  import { DoubleBounce } from "svelte-loading-spinners";
  import * as Card from "$lib/components/ui/card/index.js";
  import { initializeAppStores } from "$lib/zelij_utils/stores";
  import { loadConfig } from "$lib/zelij_utils/zelij_config";
  import { Toaster, toast } from "svelte-sonner";
  import { dataLoaded } from '$lib/zelij_utils/stores';


  let { children } = $props();
  let appReady = $state(false);
  let error: Error | null = $state(null);

  // Initialize theme for JS
  onMount(async () => {
    try {
      await loadConfig();
      initializeAppStores();
      appReady = true;
      toast.loading("Loading data...");
      loadData()
        .then(() => {
          dataLoaded.set(true);
          toast.success("Data loaded successfully");
        })
        .catch((e) => {
          console.error("loadData() failed:", e);
          toast.error("Failed to load data");
        });
    } catch (e) {
      error = e as Error;
    }
  });
</script>

<Toaster />
{#if !appReady && !error}
  <!-- loading screen -->
  <div
    class="flex items-center justify-center h-screen w-screen"
  >
    <Card.Root>
      <Card.Header>
        <Card.Title>App is Loading...</Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="flex items-center justify-center">
          <DoubleBounce size="60" color="#FF3E00" />
        </div>
      </Card.Content>
    </Card.Root>
  </div>
{:else if error}
  <div class="p-4 text-red-600 font-semibold">
    Something went wrong: {error.message}
  </div>
{:else}
  <!-- <Sidebar.Provider open={false}>
    <ModeWatcher />
    <AppSidebar />
    <div>
      <SiteHeader />
      <main>
        <div class="w-screen h-screen shadow-md" id="page">
          {@render children?.()}
        </div>
      </main>
    </div>
  </Sidebar.Provider> -->
  <ModeWatcher />
    <div>
      <SiteHeader />
      <main>
        <div class="w-screen h-screen shadow-md" id="page">
          {@render children?.()}
        </div>
      </main>
    </div>
{/if}
