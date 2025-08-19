<script>
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { getDataSourceByName, dataLoaded } from '$lib/zelij_utils/stores';
    import { paginateData, getRowCount } from "$lib/zelij_utils/duckdb";
    import DataTable from "$custom_ui/data_table/data_table.svelte";
    import { renderComponent } from "$lib/components/ui/data-table/index.js";

    const dataSourceName = page.params.data_source_name;
    let dataSource = $derived(getDataSourceByName(dataSourceName));
    let pagination = $state({ pageIndex: 0, pageSize: 20 });
	let sorting = $state([]);
	let rowCount = $state();
    let columnVisibility = $state({});
    let datasetColumns = $derived(dataSource.columns);
    let columns = $derived(processTableColumns(datasetColumns));


	async function fetchData() {
		if (!dataSourceName) {
            return { arrowTable: null, rowCount: 0 };
        }
		const arrowTable = await paginateData(dataSourceName, columnVisibility, pagination, sorting);
		const rowCount = await getRowCount(dataSourceName);
		return {arrowTable, rowCount};

	}

    function getDataFromArrowTable(table) {
        if (!table) return [];
        const data = table.toArray().map((row) => row.toJSON());
        return data;
    }

    function getColumnsFromArrowTable(table) {
        if (!table) return [];
        const columns = table.schema.fields.map((field) => ({
            accessorKey: field.name,
            header: field.name,
            enableSorting: true,
        }));
        return columns;
    }

    function processTableColumns(dataset_columns) {
        return datasetColumns.map(col => ({
            accessorKey: col.label,
            header: col.label,
            enableSorting: true,
            enableHiding: true,
        }));
    }


</script>
{#if $dataLoaded}
    <div class="h-full flex flex-col grow overflow-hidden">
        <div class="flex flex-col items-center h-full grow overflow-hidden">
            {#await fetchData() then {arrowTable, rowCount}}
                {@const data = getDataFromArrowTable(arrowTable)}
                {@const datasetLabel = dataSource.label}
                <DataTable 
                    {datasetLabel}
                    {data} 
                    {rowCount} 
                    {columns}
                    bind:columnVisibility 
                    bind:pagination 
                    bind:sorting
                />
            {/await}
        </div>
    </div>
{/if}