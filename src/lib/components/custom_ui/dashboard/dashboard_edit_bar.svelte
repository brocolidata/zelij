<script>
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Switch } from "$lib/components/ui/switch/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import {
        Check,
        FileSymlink,
        Save,
        SlidersHorizontal,
        SquarePlus,
    } from "@lucide/svelte";
    import ExportConfigDrawer from "$custom_ui/export_config_drawer.svelte";
    import { getExportableDashboardState } from "$lib/zelij_utils/grid_utils";
    import { dashboardNameExists } from "$lib/zelij_utils/stores";

    let {
        editMode = $bindable(),
        isSaving = $bindable(),
        dashboardLabel = $bindable(),
        dashboardDescription = $bindable(),
        dashboardState,
        addTile,
        COLS,
        onEditModeToggle,
        onSave,
    } = $props();

    let disableSave = $state(false);
    let dashboardExport = $derived(
        getExportableDashboardState($state.snapshot(dashboardState), COLS),
    );
    let saveSuccess = $state(false);
    let openExportConfigDrawer = $state(false);
    let dashboardNameAlreadyExists = $derived(dashboardNameExists(dashboardState.name));
    $effect( () => {
        if (dashboardLabel === "" || dashboardNameAlreadyExists === true) {
            disableSave = true;
        } else {
            disableSave = false;
        }
    })

    async function saveDashboard() {
        isSaving = true;
        onSave();
        console.log(`Successfully saved ${dashboardLabel} dashboard.`);

        // Trigger animation
        saveSuccess = true;
        // Reset to original after 2 seconds
        setTimeout(() => {
            saveSuccess = false;
        }, 2000);

        isSaving = false;
    }

    function dispatchEditModeToggle() {
        onEditModeToggle();
    }
</script>

<div
    class="dashboard-bar bg-gray-200 dark:bg-gray-700 py-2 px-4 flex flex-wrap space-x-4"
>
    <Popover.Root>
        <Popover.Trigger class={buttonVariants({ variant: "secondary" })}>
            <SlidersHorizontal class="mr-2 size-4" />
            Dashboard settings
        </Popover.Trigger>
        <Popover.Content
            class="w-80 mt-2 p-4 bg-white dark:bg-gray-800 border rounded-md shadow-md"
        >
            <div class="grid gap-4">
                <div class="space-y-2">
                    <p
                        class="text-muted-foreground text-sm text-gray-500 dark:text-gray-400"
                    >
                        Dashboard settings
                    </p>
                </div>
                <div class="grid gap-2">
                    <div class="grid grid-cols-3 items-center gap-x-4 gap-y-1.5">
                        <Label
                            for="dashboard_label"
                            class="text-right text-sm font-medium text-gray-700 dark:text-gray-100"
                            >Label</Label
                        >
                        <Input
                            id="dashboard_label"
                            bind:value={dashboardLabel}
                            class="col-span-2 h-8 rounded-md border shadow-sm focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
                        />
                        {#if dashboardNameAlreadyExists === true}
                            <p 
                                class="col-span-full text-sm text-red-500 dark:text-red-500"
                            >
                                This dashboard label already exists
                            </p>
                        {/if}
                    </div>
                    <div class="grid grid-cols-3 items-center gap-4">
                        <Label
                            for="dashboard_description"
                            class="text-right text-sm font-medium text-gray-700 dark:text-gray-100"
                            >Description</Label
                        >
                        <Input
                            id="dashboard_description"
                            bind:value={dashboardDescription}
                            class="col-span-2 h-8 rounded-md border shadow-sm focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 text-sm text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>
            </div>
        </Popover.Content>
    </Popover.Root>
    <Button variant="secondary" onclick={addTile} class="flex items-center">
        <SquarePlus class="mr-2 size-4" />
        Add Tile
    </Button>
    <!-- <Button variant="secondary" onclick={saveDashboard} disabled={disableSave} class="flex items-center">
        <Save class="mr-2 size-4" />
        Save Dashboard
    </Button> -->
    <Button
        variant="secondary"
        onclick={saveDashboard}
        disabled={disableSave || isSaving}
        class="flex items-center"
    >
        {#if saveSuccess}
            <Check
                class="mr-2 size-4 text-green-600 transition-opacity duration-300"
            />
            Save Dashboard
        {:else}
            <Save class="mr-2 size-4" />
            Save Dashboard
        {/if}
    </Button>
    <Button
        variant="secondary"
        onclick={() => (openExportConfigDrawer = true)}
        class="flex items-center"
    >
        <FileSymlink class="mr-2 size-4" />
        Export
    </Button>
    <ExportConfigDrawer
        {dashboardExport}
        bind:isOpen={openExportConfigDrawer}
    />
    <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-700 dark:text-gray-300">View</span>
        <Switch
            id="edit-mode"
            bind:checked={editMode}
            onCheckedChange={dispatchEditModeToggle}
        />
        <span class="text-sm text-gray-700 dark:text-gray-300">Edit</span>
    </div>
</div>
