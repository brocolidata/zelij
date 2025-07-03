<script>
    import { Label } from "$lib/components/ui/label/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import Combobox from "$custom_ui/combobox.svelte";
    import { aggregationOptions } from "$lib/zelij_utils/charts_utils";

    let {
        columnOptions,
        mainMetric = $bindable(),
        secondaryMetrics = $bindable(),
    } = $props();

    function removeMetric(indexToRemove) {
        secondaryMetrics = secondaryMetrics.filter((_, index) => index !== indexToRemove);
    }
</script>

<!-- Metrics Section -->
<div class="mt-6">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Metrics
    </h2>

    <div class="flex flex-col mb-4">
        <div class="flex gap-1">
            <!-- <div class="flex-1 flex flex-col space-y-1"> -->
            <div class="w-2/3 flex flex-col space-y-1">
                <Label class="text-sm font-medium">Main metric</Label>
                <Combobox
                    boxOptions={columnOptions}
                    objectName="metric column"
                    bind:value={mainMetric.column}
                />
            </div>
    
            <!-- <div class="w-[120px] flex flex-col space-y-1"> -->
            <div class="w-1/3 flex flex-col space-y-1">

                <Label class="text-sm font-medium">Aggregation</Label>
                <Combobox
                    boxOptions={aggregationOptions}
                    objectName="aggregation"
                    bind:value={mainMetric.aggregation}
                />
            </div>
        </div>
    </div>

    <!-- Secondary Metrics -->
    <div class="space-y-4">
        {#each secondaryMetrics as metric, index (index)}
            <div class="flex items-end gap-2">
                <!-- Column + Aggregation combo -->
                <div class="flex flex-1 gap-2">
                    <div class="w-2/3 flex flex-col space-y-1">
                        <Label class="text-sm font-medium">
                            Metric column {index + 2}
                        </Label>
                        <Combobox
                            boxOptions={columnOptions}
                            objectName="metric column"
                            bind:value={metric.column}
                        />
                    </div>

                    <div class="w-1/3 flex flex-col space-y-1">
                        <Label class="text-sm font-medium">Aggregation</Label>
                        <Combobox
                            boxOptions={aggregationOptions}
                            objectName="aggregation"
                            bind:value={metric.aggregation}
                        />
                    </div>
                </div>

                <!-- Remove Button -->
                <Button
                    variant="ghost"
                    size="icon"
                    class="text-red-500 mb-[2px]"
                    onclick={() => removeMetric(index)}
                    aria-label="Remove metric"
                >
                    ✕
                </Button>
            </div>
        {/each}

    </div>

    <!-- Add another metric -->
    {#if mainMetric.column !== "" && mainMetric.aggregation !== "" }
        <Button
            variant="link"
            class="mt-2"
            onclick={() =>
                (secondaryMetrics = [
                    ...secondaryMetrics,
                    { column: "", aggregation: "" },
                ])}
        >
            + Add another metric
        </Button>
    {/if}
</div>
