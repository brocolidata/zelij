<script>
    import { onMount } from "svelte";
    import { getDashboardByName, updateDashboard } from "$lib/zelij_utils/stores";
    import Grid from "svelte-grid";
    import gridHelp from "svelte-grid/build/helper/index.mjs";
    import Tile from "$custom_ui/dashboard/tile.svelte";
    import DashboardEditBar from "$custom_ui/dashboard/dashboard_edit_bar.svelte";
    import {
        labelToName,
        createNewTile,
        removeTile,
        updateTile as updateTileHelper,
        toggleEditInTiles
    } from "$lib/zelij_utils/grid_utils.ts";

    let {
        dashboardName=$bindable(),
        dataAppName="",
        onSave
    } = $props()

    const COLS = 6;
    const cols = [[1200, COLS]];
    const id = () => "_" + Math.random().toString(36).substr(2, 9);
    const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;

    let isSaving = $state(false);
    let editMode = $state(true);
    let adjustAfterRemove = false;
    let dashboard = $state({});
    let dashboardLabel = $state("");
    let dashboardDescription = $state("");
    let dashboardState = $derived({
        name:labelToName(dashboardLabel),
        label:dashboardLabel,
        description:dashboardDescription,
        tiles:items
    });
    let items = $derived.by(() => {
        if (dashboard?.tiles) {
            return dashboard.tiles.map((tile) => ({
                ...tile,
                [COLS]: gridHelp.item(tile[COLS] || { x: 0, y: 0, w: 2, h: 2 }),
            }));
        } else {
            return [];
        }
    })
    // svelte-ignore state_referenced_locally
    // let { definition_source, ...cleanDashboard } = dashboard || {};
    onMount(() => {
        if (dashboardName) {
            dashboard = getDashboardByName(dashboardName);
            if (dashboard) {
                dashboardLabel = dashboard.label;
                dashboardDescription = dashboard.description;
                // let { definition_source, ...cleanDashboard } = dashboard || {};
                let { definition_source, ...cleanDashboard } = dashboard;
                dashboardState = cleanDashboard;
            }
        }
        toggleEdit(); // ensure attributes are set based on editMode
    });

    function toggleEdit() {
        items = toggleEditInTiles(items, COLS, editMode);
    }
    
    function addTile() {
        items = [...items, createNewTile(editMode, items)];
    }

    function remove(item) {
        items = removeTile(items, item.id, adjustAfterRemove);
    }

    function saveDashboard() {
        // dashboardName = labelToName(dashboardLabel);
        onSave(dashboardState);
        console.log(`Successfully saved ${dashboardLabel} dashboard.`);
    }

    function updateTile(updated) {
        items = updateTileHelper(items, updated);
    }

</script>

<DashboardEditBar
    bind:editMode
    bind:dashboardLabel
    bind:dashboardDescription
    {dashboardState}
    {addTile}
    {COLS}
    onEditModeToggle={toggleEdit}
    onSave={saveDashboard}
/>

<div class="flex items-center justify-between space-y-2 ps-8 pt-3">
    <h2 class="text-3xl font-bold tracking-tight">{dashboardLabel}</h2>
</div>

<div class="w-full">
    <Grid bind:items rowHeight={100} let:item let:dataItem {cols}>
        <Tile
            remove={() => remove(dataItem)}
            {dataItem}
            {editMode}
            onUpdate={(event) => updateTile(event)}
        />
    </Grid>
</div>
