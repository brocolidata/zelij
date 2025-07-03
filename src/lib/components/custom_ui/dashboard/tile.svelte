<script>
    import { writable } from "svelte/store";
    import { getDataByQuery } from "$lib/zelij_utils/duckdb";
    import * as echarts from "echarts";
    import { resize } from "@svelte-put/resize";
    import { onMount, onDestroy, tick } from "svelte";
    import TileEditBar from "$custom_ui/dashboard/tile_edit_bar.svelte";
    import { mode, userPrefersMode } from "mode-watcher";
    import { 
        fetchColumnOptions,
        buildChartQuery, 
        buildOptionsFromUI, 
        extractDatasetFromChartConfiguration,
        addWhereStatement
    } from "$lib/zelij_utils/charts_utils";
    import { getContext } from 'svelte';
    import { getDataSourceByName, dataLoaded } from '$lib/zelij_utils/stores';


    let { remove, dataItem = $bindable(), editMode, onUpdate } = $props();
    let lastHighlighted = $state(null);
    let chart = $state();
    let chartContainer = $state();
    let datasetRows = writable([]);
    let chartConfiguration = $state(dataItem?.chartConfiguration || {});
    let datasetName = $state();
    let initializedChart = $state(false);
    let filtersStore = getContext('filters');
    let chartFilters = $state([]);
    let datasetColumns = $derived(getDatasetColumns(datasetName));

    function getDatasetColumns(name) {
        const dataSource = getDataSourceByName(name);
        return dataSource.columns;
    }
    
    onMount(async () => {
        datasetName = extractDatasetFromChartConfiguration(dataItem?.chartConfiguration);
        initChart();
        if (datasetName !== null && $dataLoaded) {
            await refreshTile();
        }
        await tick();
        if (filtersStore) {
            // Subscribe to the filter store *after* the component has mounted
            const unsubscribe = filtersStore.subscribe((filters) => {
                // Filter only those relevant to this tile
                const activeFilters = filters.filter(
                    (f) => (
                        f.datasetName === datasetName &&
                        f.tileID !== dataItem?.id
                    )
                );
                console.log(`DEBUG activeFilters for tile ${dataItem?.id}: `, activeFilters);

                // Rebuild query if filters changed
                if (initializedChart && activeFilters.length > 0 && $dataLoaded) {
                    refreshQueryWithFilters(activeFilters);
                } else if (initializedChart && activeFilters.length === 0 && $dataLoaded) {
                    refreshTile();
                }
                
            });
        }    
        initializedChart = true;
        
        return () => {
            unsubscribe?.();
            chart.dispose();
        };
    });
    $effect(() => {
        if ($dataLoaded && initializedChart === true) {
            setupEventListeners();   
        }
    })

    function getColumnTypeByName(columnName) {
        const column = datasetColumns.find(col => col.value === columnName);
        return column ? column.type : undefined;
    }

    function setupEventListeners() {
        chart.on('click', (params) => {
            console.log('chart clicked:', params);
            const dimensionCandidates = params.dimensionNames.filter(name => name !== params.seriesName);
            const filterDimension = dimensionCandidates[0];
            const filterValue = params.value[filterDimension];

            const filter = {
                tileID: dataItem?.id,
                datasetName: datasetName,
                column: filterDimension,
                columnType: getColumnTypeByName(filterDimension),
                value: filterValue,
                dispatchEvent: {
                    seriesIndex:params.seriesIndex,
                    dataIndex:params.dataIndex,
                }
            };

            filtersStore.update((current) => {
                const existsInFiltersStore = current.some(
                    (f) => (
                        f.tileID === filter.tileID &&
                        f.datasetName === filter.datasetName &&
                        f.column === filter.column &&
                        f.value === filter.value
                    )
                );
                return existsInFiltersStore ? current : [...current, filter];
            });
            const existsInChartFilters = chartFilters.some(
                (f) => (
                    f.tileID === filter.tileID &&
                    f.datasetName === datasetName &&
                    f.column === filter.column &&
                    f.value === filter.value
                )
            );
            if (!existsInChartFilters) {
                chartFilters = [...chartFilters, filter];
            }
        });
    }
    
    function initChart() {
        chart = echarts.init(chartContainer, $mode === 'dark' ? 'dark' : undefined);
        if (chartConfiguration?.type ) {
            chart.showLoading();
        }
    }
    
    function refreshQueryWithFilters(activeFilters) {
        let sqlQueryWFilters;
        let chartOptions;
        if (dataItem?.chartConfiguration.type === "ui") {
            sqlQueryWFilters = buildChartQuery(chartConfiguration.configuration, datasetColumns, activeFilters);
            chartOptions = buildOptionsFromUI(
                {...dataItem?.chartConfiguration.configuration, theme:$mode})
        } else {
            const { sqlQuery, chartOptions: configChartOptions } = dataItem?.chartConfiguration.configuration;
            sqlQueryWFilters = addWhereStatement(sqlQuery, datasetColumns, activeFilters);
            chartOptions = configChartOptions;

        }
		applyFiltersOnTile(sqlQueryWFilters, chartOptions);
	}

    export function unselect(filter) {
        chart?.dispatchAction({
            type: 'unselect',
            ...filter.dispatchEvent
        });
	}

    mode.subscribe(
        async theme => {
            if (initializedChart) {
                filtersStore.set([]); 
                await reinitChart();
            }
        }
    )
    dataLoaded.subscribe(
        isLoaded => {
            if (isLoaded && initializedChart) {
                refreshTile()
            }
        }
    )
    
    async function reinitChart() {
        disposeOfChart();   // clean current chart
        await tick();
        initChart();
        await refreshTile();     // redraw the chart options
    }
    
    function resizeChart() {
        if (chart?.isDisposed !== true) {
            chart.resize();
        }
        
    }

    function disposeOfChart() {
        chart.dispose();
    }

    async function getDatasetFromQuery(query) {
        try {
            const arrowTable = await getDataByQuery(query);
            const columns = arrowTable.schema.fields.map((field) => field.name);
            const rawRows = arrowTable.toArray();
            const rows = rawRows.map((row) => {
                const rowData = {};
                columns.forEach((col, index) => {
                    rowData[col] = row[col];
                });
                return rowData;
            });
            return rows;
        } catch (error) {
            console.error("Error executing query:", error);
            return [];
        }
    }

    async function saveTile() {
        try {
            await refreshTile();
            const {temp, ...chartConfigurationCleaned} = chartConfiguration;
            onUpdate({
                id: dataItem.id,
                chartConfiguration: chartConfigurationCleaned
            });
        } catch (e) {
            console.error("Error saving tile:", e);
            datasetRows.set([]);
        }
    }

    async function applyFiltersOnTile(sqlQuery, chartOptions) {
        const rows = await getDatasetFromQuery(sqlQuery);
        datasetRows.set(rows);
        const fullChartOptions = {
            ...chartOptions,
            dataset: { source: $datasetRows }
        };
        chart.setOption(fullChartOptions);
    }

    async function refreshTile() {
        if (chartConfiguration.type === "advanced") {
            const { sqlQuery, chartOptions } = chartConfiguration.configuration;
            const rows = await getDatasetFromQuery(sqlQuery);
            datasetRows.set(rows);
            const fullChartOptions = { 
                ...chartOptions, 
                dataset: { source: $datasetRows } 
            };
            chart.setOption(fullChartOptions);
        } else {
            const sqlQuery = buildChartQuery(chartConfiguration.configuration, datasetColumns);
            const rows = await getDatasetFromQuery(sqlQuery);
            const UIChartOptions = buildOptionsFromUI(
                {...chartConfiguration.configuration, theme:$mode})
            datasetRows.set(rows);
            const fullChartOptions = {
                ...UIChartOptions,
                dataset: { source: $datasetRows }
            };
            chart.setOption(fullChartOptions);
        }
        chart.hideLoading();
    }

</script>

<div class="h-full w-full flex flex-col bg-card">
    {#if editMode}
        <TileEditBar 
            remove={() => remove(dataItem)} 
            bind:chartConfiguration
            onSave={saveTile}
        />
    {/if}

    <div
        bind:this={chartContainer}
        class="chart-container items-center justify-center w-full flex-grow"
        use:resize onresized={resizeChart}
    ></div>
</div>