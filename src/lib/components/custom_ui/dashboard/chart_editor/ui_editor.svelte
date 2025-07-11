<script>
    import Button from "$lib/components/ui/button/button.svelte";
    import { getDataSources } from "$lib/zelij_utils/zelij_config";
    import Combobox from "$custom_ui/combobox.svelte";
    import ChartDimensions from "./ui_editor_components/chart_dimensions.svelte";
    import ChartMetrics from "./ui_editor_components/chart_metrics.svelte";
    import ChartSeries from "./ui_editor_components/chart_series.svelte";
    import ChartProperties from "./ui_editor_components/chart_properties.svelte";
    import ChartOrder from "./ui_editor_components/chart_order.svelte";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { CircleAlert, Check, Save } from "@lucide/svelte";
    import {
        fetchColumnOptions,
        getDataSourceOptions,
        buildChartQuery,
        runChartQuery
    } from "$lib/zelij_utils/charts_utils";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { getDataSourceByName, dataLoaded } from '$lib/zelij_utils/stores';
    
    let { configuration = $bindable(), onSave } = $props(); 

    const data_sources = getDataSources();
    const dataSourceOptions = getDataSourceOptions(data_sources);
    let chartProperties = $state(configuration?.chartProperties || {});
    let dataSource = $state(configuration?.dataset || "");
    let datasetColumns = $derived(getDatasetColumns(dataSource));
    let mainDimension = $state(configuration?.mainDimension || "");
    let secondaryDimension = $state(configuration?.secondaryDimension || "");
    let mainDimensionType = $state(configuration?.mainDimensionType)
    let secondaryDimensionType = $state(configuration?.secondaryDimensionType)
    let mainMetric = $state(configuration?.mainMetric || { column: "", aggregation: "" });
    let secondaryMetrics = $state(configuration?.secondaryMetrics || []);
    let orderByColumn = $state(configuration?.orderByColumn || "");
    let orderByType = $state(configuration?.orderByColumn || "desc");
    let seriesList = $state(configuration?.seriesList || []);
    let dimensionOnXAxis = $state(configuration?.dimensionOnXAxis ?? true);
    // svelte-ignore state_referenced_locally
    let previousDataSource = $state(dataSource);

    // Configuration validation state
    let configIsInvalid = $state(false);
    
    // Inputs assembly states
    let queryInputsValid = $derived(() =>
		dataSource &&
		mainDimension &&
		(mainMetric?.column && mainMetric?.aggregation ||
		secondaryMetrics.some(m => m.column && m.aggregation))
	);
    let chartQueryParams = $derived({
		dataset: dataSource,
		mainDimension: mainDimension,
		secondaryDimension: secondaryDimension,
		mainMetric: mainMetric,
		secondaryMetrics: secondaryMetrics
	});
    let chartQuery = $derived(
		queryInputsValid ? buildChartQuery(chartQueryParams) : null
	);

    // Series state
    let chartDataColumns = $state([]);

    // Save dashboard state
    let disableSave = $state(false);
    let saveSuccess = $state(false);
    let isSaving = $state(false);
    let chartLabel = $derived(chartProperties?.chartLabel)
    let isChartLabelEmpty = $state(true);

    // Refresh configIsInvalid
    $effect(() => {
        configIsInvalid = secondaryDimension !== "" && secondaryMetrics.length > 0;
        disableSave = configIsInvalid;
    });
    $effect(() => {
        isChartLabelEmpty = chartLabel === "";
        disableSave = isChartLabelEmpty;
    });
    $effect(() => {
        if (dataSource !== previousDataSource) {
            updateColumns();
            previousDataSource = dataSource
        }
    })

    function getDatasetColumns(name) {
        const dataSourceObj = getDataSourceByName(name);
        return dataSourceObj.columns;
    }

    // Function to refetch column options when dataSource changes
    async function updateColumns() {
        if (dataSource) {
            // Reset dimensions when changing dataset
            mainDimension = "";
            mainDimensionType = "";
            secondaryDimension = "";
            secondaryDimensionType = "";
        }
    }

    // Fetch preview data for column inference
	$effect(async () => {
		if (!chartQuery) return;
		const { columns } = await runChartQuery(chartQuery);
		chartDataColumns = columns;
	});
    
    function saveConfiguration() {
        isSaving = true;
        
        configuration = {
            dataset: dataSource,
            mainDimension,
            secondaryDimension,
            mainDimensionType,
            secondaryDimensionType,
            mainMetric,
            secondaryMetrics,
            orderByColumn,
            orderByType,
            seriesList,
            dimensionOnXAxis,
            chartProperties,
        }
        previousDataSource = dataSource
        onSave();
        
        // Trigger animation
        saveSuccess = true;

        // Reset to original after 2 seconds
        setTimeout(() => {
            saveSuccess = false;
        }, 2000);

        isSaving = false;
    }

    $inspect(mainDimensionType);
    $inspect(secondaryDimensionType);
        
   
</script>

<!-- UI -->



<div class="px-4">
    <div class="my-4">
        {#if configIsInvalid === true}
            <div class="mt-4 text-red-500 text-sm font-medium">
                <Alert.Root variant="destructive">
                    <CircleAlert class="size-4" />
                    <Alert.Title>Error</Alert.Title>
                    <Alert.Description>
                        You can't use a secondary dimension and multiple metrics at the
                        same time
                    </Alert.Description>
                </Alert.Root>
            </div>
        {/if}

        {#if isChartLabelEmpty === true}
            <div class="mt-4 text-red-500 text-sm font-medium">
                <Alert.Root variant="destructive">
                    <CircleAlert class="size-4" />
                    <Alert.Title>Label required</Alert.Title>
                    <Alert.Description> 
                        You must set a label for the chart
                    </Alert.Description>
                </Alert.Root>
            </div>
        {/if}
    </div>
    <div class="flex justify-between mt-4 gap-x-2 space-y-2">
        <Label>Dataset</Label>
        <Combobox
            boxOptions={dataSourceOptions}
            objectName="data source"
            bind:value={dataSource}
        />
    </div>
    <div class="my-4">
        <ChartProperties bind:chartProperties />
    </div>
    <div class="py-2">
        <Separator />
    </div>
    {#if dataSource}
        <ChartDimensions
            columnOptions={datasetColumns}
            bind:mainDimension
            bind:secondaryDimension
            bind:mainDimensionType
            bind:secondaryDimensionType
        />
        <div class="py-2">
            <Separator />
        </div>
        <ChartMetrics
            columnOptions={datasetColumns}
            bind:mainMetric
            bind:secondaryMetrics
        />
        {#if mainDimension && mainMetric?.column && mainMetric?.aggregation}
            <div class="py-2">
                <Separator />
            </div>
            <ChartOrder 
                columnOptions={datasetColumns}
                {chartDataColumns}
                bind:orderByColumn
                bind:orderByType
            />
        {/if}
        {#if mainDimension && mainMetric?.column && mainMetric?.aggregation}
            <div class="py-2">
                <Separator />
            </div>
            <ChartSeries
                {chartQueryParams}
                {chartDataColumns} 
                bind:seriesList
                {queryInputsValid}
                bind:dimensionOnXAxis
            />
            <Button 
                variant="secondary" 
                onclick={saveConfiguration} 
                disabled={disableSave || isSaving} 
                class="flex items-center mt-4"
            >
                {#if saveSuccess}
                    <Check class="mr-2 size-4 text-green-600 transition-opacity duration-300" />
                    Save chart
                {:else}
                    <Save class="mr-2 size-4" />
                    Save chart
                {/if}
            </Button>
        {/if}
    {:else}
        
        <Alert.Root>
            <CircleAlert class="size-4" />
            <Alert.Title>Next step: dataset selection</Alert.Title>
            <Alert.Description>
                Select a dataset to see its dimensions and metrics
            </Alert.Description
            >
        </Alert.Root>
    {/if}
</div>
