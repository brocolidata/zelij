<script>
    import { Label } from "$lib/components/ui/label/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import Combobox from "$custom_ui/combobox.svelte";
    import * as Collapsible from "$lib/components/ui/collapsible/index.js";
    import { aggregationOptions } from "$lib/zelij_utils/charts_utils";
    import { ChevronDown, ChevronUp, Sigma } from "@lucide/svelte";

    let {
        columnOptions,
        metricConfiguration = $bindable(),
    } = $props();   

    let collapsibleisOpen = $state(true);

    function removeMetric(indexToRemove) {
        metricConfiguration.secondary = metricConfiguration.secondary.filter(
            (_, index) => index !== indexToRemove,
        );
    }
</script>

<!-- Metrics Section -->
<Collapsible.Root bind:open={collapsibleisOpen}>
    <div class="flex items-center justify-between space-x-4">
        <div class="mt-4 mb-2 flex items-center gap-2">
            <Sigma size={16} />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Metrics
            </h2>
        </div>
        <Collapsible.Trigger
            class={buttonVariants({
                variant: "ghost",
                size: "sm",
                class: "w-9 p-0",
            })}
        >
            {#if collapsibleisOpen === true}
                <ChevronUp />
            {:else}
                <ChevronDown />
            {/if}
        </Collapsible.Trigger>
    </div>

    <Collapsible.Content>
        <div class="mt-1">
            <!-- <div class="flex flex-col mb-4"> -->
            <!-- This div acts as the horizontal container for your two parameter groups -->
            <!-- Use 'flex' to lay out children horizontally and 'gap-x-6' for horizontal spacing -->
            <div class="gap-x-2 flex">
                <!-- Main Metric Parameter Group -->
                <!-- 'w-2/4' sets the width. 'flex flex-col' stacks the label and combobox vertically. -->
                <div class="flex flex-col w-2/4 space-y-1">
                    <Label class="text-sm font-medium">Main metric</Label>
                    <Combobox
                        boxOptions={columnOptions}
                        objectName="metric column"
                        bind:value={metricConfiguration.main.column}
                    />
                </div>

                <!-- Aggregation Parameter Group -->
                <!-- 'w-1/4' sets the width. 'flex flex-col' stacks the label and combobox vertically. -->
                <div class="flex flex-col w-2/6 space-y-1">
                    <Label class="text-sm font-medium">Aggregation</Label>
                    <Combobox
                        boxOptions={aggregationOptions}
                        objectName="aggregation"
                        bind:value={metricConfiguration.main.aggregation}
                    />
                </div>
            </div>
        </div>

        <!-- Secondary Metrics -->
        <div class="space-y-4 gap-x-2">
            {#each metricConfiguration.secondary as metric, index (index)}
                <div class="flex mt-4 items-end gap-2">
                    <!-- Metric Column Combobox Group -->
                    <!-- This flex-col stacks the Label and the Combobox vertically. -->
                    <div class="flex flex-col w-2/4 space-y-1">
                        <Label class="text-sm font-medium">
                            Metric column {index + 2}
                        </Label>
                        <Combobox
                            boxOptions={columnOptions}
                            objectName="metric column"
                            bind:value={metric.column}
                        />
                    </div>

                    <!-- Aggregation Combobox Group -->
                    <!-- This flex-col stacks the Label and the Combobox vertically. -->
                    <div class="flex flex-col w-2/6 space-y-1">
                        <Label class="text-sm font-medium">Aggregation</Label>
                        <Combobox
                            boxOptions={aggregationOptions}
                            objectName="aggregation"
                            bind:value={metric.aggregation}
                        />
                    </div>

                    <!-- Remove Button -->
                    <!-- The 'items-end' on the parent div will align this button's bottom with the bottom of the combobox groups. -->
                    <!-- The 'mb-[2px]' class is no longer needed as 'items-end' handles the alignment. -->
                    <Button
                        variant="ghost"
                        size="icon"
                        class="text-red-500 justify-center"
                        onclick={() => removeMetric(index)}
                        aria-label="Remove metric"
                    >
                        ✕
                    </Button>
                </div>
            {/each}
        </div>

        <!-- Add another metric -->
        {#if metricConfiguration.main.column !== "" && metricConfiguration.main.aggregation !== ""}
            <Button
                variant="link"
                class="mt-2"
                onclick={() =>
                    (metricConfiguration.secondary = [
                        ...metricConfiguration.secondary,
                        { column: "", aggregation: "" },
                    ])}
            >
                + Add a metric
            </Button>
        {/if}
    </Collapsible.Content>
</Collapsible.Root>
