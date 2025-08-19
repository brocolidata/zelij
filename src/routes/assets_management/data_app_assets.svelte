<script>
    import DataTable from "$custom_ui/data_table/data_table.svelte";
    import { dataAppsIndex } from "$lib/zelij_utils/stores";
    import RowActions from "$custom_ui/assets_management/row_actions.svelte";
    import LocalStorageSwitch from "$custom_ui/assets_management/local_storage_switch.svelte";
    import { renderComponent } from "$lib/components/ui/data-table/index.js";
    
    const datasetColumns = $state([
        {label:'label', type: 'VARCHAR'},
        {label:'definition source', accessorKey: 'definition_source', type: 'VARCHAR'},
        {label:'dashboards', type: 'ARRAY'}
    ]);
    let columns = $derived(processTableColumns(datasetColumns));
    let pagination = $state({ pageIndex: 0, pageSize: 10 });
	let sorting = $state([]);
	let rowCount = $state();
    let columnVisibility = $state({});

    function processTableColumns(dataset_columns) {
        const processedColumns = datasetColumns.map(col => ({
            accessorKey: col?.accessorKey || col.label,
            header: col.label,
            enableSorting: true,
            enableHiding: true,
        }));
        processedColumns.push({
            id: "sync_state",
            header: "Sync. state",
            cell: ({ row }) => {
                return renderComponent(LocalStorageSwitch, { row: row.original, assetStore: dataAppsIndex });
            },
            enableHiding: false,
            enableSorting: false,
        });
        processedColumns.push({
            id: "actions",
            cell: ({ row }) => {
                return renderComponent(RowActions, { row: row.original, assetType: 'data_apps' });
            },
            enableHiding: false,
            enableSorting: false,
        });
        return processedColumns;
    }

</script>


<DataTable 
    datasetLabel="Data apps"
    data={$dataAppsIndex}
    {columns}
    rowCount={$dataAppsIndex.length}
    bind:columnVisibility 
    bind:pagination 
    bind:sorting
/>