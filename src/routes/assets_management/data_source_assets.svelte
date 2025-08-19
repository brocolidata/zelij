<script>
    import DataTable from "$custom_ui/data_table/data_table.svelte";
    import { dataSourcesIndex } from "$lib/zelij_utils/stores";
    import RowActions from "$custom_ui/assets_management/row_actions.svelte";
    import LocalStorageSwitch from "$custom_ui/assets_management/local_storage_switch.svelte";
    import { renderComponent } from "$lib/components/ui/data-table/index.js";
    
    const datasetColumns = $state([
        {label:'name', type: 'VARCHAR'},
        {label:'definition source', accessorKey: 'definition_source', type: 'VARCHAR'},
        {label:'path', type: 'VARCHAR'}
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
            id: "actions",
            cell: ({ row }) => {
                return renderComponent(RowActions, { row: row.original, assetType: 'data_sources' });
            },
            enableHiding: false,
            enableSorting: false,
        });
        return processedColumns;
    }

</script>


<DataTable 
    datasetLabel="Data source"
    data={$dataSourcesIndex}
    {columns}
    rowCount={$dataSourcesIndex.length}
    bind:columnVisibility 
    bind:pagination 
    bind:sorting
/>