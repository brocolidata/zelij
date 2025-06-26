<script>
    import { Button } from "$lib/components/ui/button";
    import JSONEditor from "$custom_ui/code_editor/json.svelte";
    import SQLEditor from "$custom_ui/code_editor/sql.svelte";

    let {
        remove,
        configuration = $bindable(),
        onSave
    } = $props();
    let sqlQueryInput = $state(configuration?.sqlQuery || "");
    let chartOptionsInput = $state(configuration?.chartOptions || "{}");
    let sqlQuery = $state("");
    let chartOptions = $state({});

    function saveChartOptions() {
        // chartOptionsInput = chartOptionsInputContent;
        chartOptions = JSON.parse(chartOptionsInput);
        configuration = {sqlQuery, chartOptions}
        onSave();  
    }

    function saveChartQuery() {
        // sqlQueryInput = sqlQueryInputContent;
        sqlQuery = sqlQueryInput
        configuration = {sqlQuery, chartOptions}
        onSave();
    }
    

</script>

<div class="mt-4 max-h-[80vh] space-y-6 overflow-auto px-4">
    <div class="space-y-2">
        <label
            for="query"
            class="block text-sm font-medium text-gray-700 dark:text-gray-100"
            >SQL Query</label
        >
        <div class="h-[220px] overflow-auto">
            <!-- <SQLEditor bind:content={sqlQueryInputContent}/> -->
            <SQLEditor bind:content={sqlQueryInput}/>
        </div>
        <Button onclick={saveChartQuery} variant="secondary">Save Query</Button>
    </div>
    <div class="space-y-2">
        <label
            for="chart_options"
            class="block text-sm font-medium text-gray-700 dark:text-gray-100"
            >Chart Options</label
        >
        <div class="h-[220px] overflow-auto">    
            <!-- <JSONEditor bind:content={chartOptionsInputContent}/> -->
            <JSONEditor bind:content={chartOptionsInput}/>
        </div>
        <Button onclick={saveChartOptions} variant="secondary">Save Chart Options</Button>
    </div>
</div>