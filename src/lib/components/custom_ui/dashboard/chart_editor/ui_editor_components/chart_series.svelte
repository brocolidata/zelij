<script>
	import { onMount } from "svelte";
	import ChartSeriesItem from "./chart_series_item.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import Switch from "$lib/components/ui/switch/switch.svelte";
	import { inferSeries, getDataColumnsOptions } from "$lib/zelij_utils/charts_utils";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
    import { ChevronDown, ChevronUp, ChartNoAxesCombined } from "@lucide/svelte";

	let {
		chartQueryParams,
		chartDataColumns,
		seriesList = $bindable(),
		queryInputsValid,
		dimensionOnXAxis = $bindable(),
	} = $props();
	let mainDimension = $derived(chartQueryParams.dimensions.main);
	let secondaryDimension = $derived(chartQueryParams.dimensions.secondary);
	let mainMetric = $derived(chartQueryParams.mainMetric);
	let secondaryMetrics = $derived(chartQueryParams.secondaryMetrics);
	let columnOptions = $derived(getDataColumnsOptions(chartDataColumns));
	let collapsibleisOpen = $state(true);

	// Generate series when inputs are valid
    $effect(() => {
		if (queryInputsValid && seriesList.length === 0 && chartDataColumns.length > 0) {
			generateSeries()
		}
	});
    
    // Series functions 
    function generateSeries() {
		seriesList = inferSeries({
			mainDimension,
			secondaryDimension,
			mainMetric,
			secondaryMetrics,
			columns: chartDataColumns
		});
	}

	function removeSeries(index) {
		seriesList = seriesList.filter((_, i) => i !== index);
	}

	function addSeries() {
		seriesList = [...seriesList, { column: "", type: "line" }];
	}

	
	
</script>

<Collapsible.Root bind:open={collapsibleisOpen}>
    <div class="flex items-center justify-between space-x-4">
		<div class="mt-4 mb-2 flex items-center gap-2">
			<ChartNoAxesCombined size={16} />
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Chart Series</h2>
		</div>
        <Collapsible.Trigger
          class={buttonVariants({ variant: "ghost", size: "sm", class: "w-9 p-0" })}
        >
            {#if collapsibleisOpen === true}
                <ChevronUp />
            {:else}
                <ChevronDown />
            {/if}
        </Collapsible.Trigger>
    </div>
    
    <Collapsible.Content>
		<div class="space-y-4 mt-6">
	
	
			<div class="flex space-x-2">
				<Label>Dimension on</Label>
				<Label>X axis</Label>
				<Switch bind:checked={dimensionOnXAxis}/>
				<Label>Y axis</Label>
			</div>
			<div class="flex flex-col space-y-3">
				{#each seriesList as series, i (i)}
					<ChartSeriesItem
						bind:series={seriesList[i]}
						{columnOptions}
						onRemove={() => removeSeries(i)}
					/>
				{/each}
			</div>

			<Button variant="link"  onclick={addSeries}
				>+ Add a series</Button
			>
			<Button onclick={generateSeries}
					>Regenerate from Dimensions & Metrics
			</Button>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
