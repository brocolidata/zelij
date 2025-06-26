<script>
    import { getDashboardByName } from "$lib/zelij_utils/stores";
    import { onMount } from "svelte";
    import Grid from "svelte-grid";
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import Tile from "$custom_ui/dashboard/tile.svelte";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import { Pencil, Ellipsis } from '@lucide/svelte';
    import {
        toggleEditInTiles
    } from "$lib/zelij_utils/grid_utils.ts";
    import DashboardFilterBar from "$custom_ui/dashboard/dashboard_filter_bar.svelte";
    import { setContext } from 'svelte';
    import { createFiltersStore } from "$lib/zelij_utils/stores";
    
    // Create one filters store for this dashboard
	// const filtersStore = createFiltersStore();
    let filtersStore = createFiltersStore();

    // Provide it to all children (tiles, filter bar, etc.)
    setContext('filters', filtersStore);

    let {
        dashboardName,
        dataAppName="",
        editURL
    } = $props()
    
    const COLS = 6;
    const cols = [[1200, COLS]];
    const editMode = false;
    let tiles = $state({});
    
    let dashboard = $derived(getDashboardByName(dashboardName));
    let items = $derived.by(() => {
        if (dashboard?.tiles) {
            return dashboard.tiles.map((tile) => ({
                ...tile,
                // ref: null, // add this line
                [COLS]: gridHelp.item(tile[COLS] || { x: 0, y: 0, w: 2, h: 2 }),
            }));
        } else {
            return [];
        }
    });
    onMount(() => {
        toggleEdit(); // ensure attributes are set based on editMode
    });
    function toggleEdit() {
        items = toggleEditInTiles(items, COLS, editMode);
    }

    function bindTileRef(item) {
        return el => item.ref = el;
    }

    function removeFilterFromTile(filterToRemove) {
        const tile = tiles[filterToRemove.tileID]
        tile?.unselect?.(filterToRemove);
    }
</script>


<DashboardFilterBar onRemoveFilter={(filterToRemove) => (removeFilterFromTile(filterToRemove))}/>
<div class="flex items-center">
    <h2 class="text-3xl font-bold tracking-tight p-4">{dashboardName}</h2>
    <!-- <div class="flex items-center space-x-2"> -->
    <DropdownMenu.Root>
        <DropdownMenu.Trigger class="{buttonVariants({ variant: "ghost", size:"icon" })} justify-center">
            <Ellipsis />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-56">
            <DropdownMenu.Group>
                <DropdownMenu.Group>
                    <DropdownMenu.Item>
                        <!-- <span>Edit</span> -->
                        <Pencil class="mr-2 size-4"/>
                        <a href={editURL} class="w-full block">Edit</a>
                    </DropdownMenu.Item>
                </DropdownMenu.Group>
            </DropdownMenu.Group>
        </DropdownMenu.Content>
    </DropdownMenu.Root>
    <!-- </div> -->
</div>

<div class="w-full">
    <Grid bind:items rowHeight={100} let:item let:dataItem {cols}>
        <Tile
            bind:this={tiles[dataItem.id]}
            dataItem={dataItem} 
            {editMode}
        />
    </Grid>
</div>