<script>
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import DataTable from "$custom_ui/data_table/data_table.svelte";
    import { dataSourcesIndex } from "$lib/zelij_utils/stores";
    import LocalStorageSwitch from "$custom_ui/assets_management/local_storage_switch.svelte";
    import { renderComponent } from "$lib/components/ui/data-table/index.js";
    import DataSourceAssets from "./data_source_assets.svelte";
    import DataAppsAssets from "./data_app_assets.svelte";
    import DashboardAssets from "./dashboard_assets.svelte";
    

    let openSettingsTab = $state("data_sources");

</script>

<h2 class="text-3xl font-bold tracking-tight p-4">Assets management</h2>

<Tabs.Root bind:value={openSettingsTab}>
    <Tabs.List>
        <Tabs.Trigger value="data_sources">Data Sources</Tabs.Trigger>
        <Tabs.Trigger value="data_apps">Data Apps</Tabs.Trigger>
        <Tabs.Trigger value="dashboards">Dashboards</Tabs.Trigger>
    </Tabs.List>

    <div class="flex-grow overflow-y-auto p-4">
        <Tabs.Content value="data_sources">
            <DataSourceAssets />
        </Tabs.Content>
        <Tabs.Content value="data_apps">
            <DataAppsAssets />
        </Tabs.Content>
        <Tabs.Content value="dashboards">
            <DashboardAssets />
        </Tabs.Content>
    </div>
</Tabs.Root>
