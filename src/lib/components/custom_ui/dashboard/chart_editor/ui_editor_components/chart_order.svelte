<script>
    import { Label } from "$lib/components/ui/label/index.js";
    import Combobox from "$custom_ui/combobox.svelte";
    import * as Collapsible from "$lib/components/ui/collapsible/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import { ChevronDown, ChevronUp } from "@lucide/svelte";

    let {
        columnOptions,
        chartDataColumns,
        orderByColumn = $bindable(),
        orderByType = $bindable(),
    } = $props();

    let orderByOptions = $derived(generateOrderByColumns(columnOptions, chartDataColumns));
    let collapsibleisOpen = $state(true);
    const orderByTypeOptions = [
        {label:"Ascending", value:"asc"},
        {label:"Descending", value:"desc"}
    ];
    function generateOrderByColumns(columnOptionsArray, chartDataColumnsArray) {
        // 1. Remove objects whose label is in chartDataColumns
        const filteredChartOptions = columnOptionsArray.filter(
            (option) => !chartDataColumnsArray.includes(option.label)
        );

        // 2. Create new objects for each element in chartDataColumns
        const newChartOptions = chartDataColumnsArray.map((column) => ({
            label: column,
            value: column,
            // Add any other default properties you need for these new objects
            // For example: value: column, type: 'category' etc.
        }));

        // 3. Add the new objects at the beginning of the filtered array
        return [...newChartOptions, ...filteredChartOptions];
    }   

</script>

<Collapsible.Root bind:open={collapsibleisOpen}>
    <div class="flex items-center justify-between space-x-4">
        <h2 class="mt-4 mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Order By
        </h2>
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
                    <Label class="text-sm font-medium">Column</Label>
                    <Combobox
                        boxOptions={orderByOptions}
                        objectName="column"
                        bind:value={orderByColumn}
                    />
                </div>

                <!-- Aggregation Parameter Group -->
                <!-- 'w-1/4' sets the width. 'flex flex-col' stacks the label and combobox vertically. -->
                <div class="flex flex-col w-2/6 space-y-1">
                    <Label class="text-sm font-medium">Asc/Desc</Label>
                    <Combobox
                        boxOptions={orderByTypeOptions}
                        objectName="order type"
                        bind:value={orderByType}
                    />
                </div>
            </div>
        </div>
    </Collapsible.Content>
</Collapsible.Root>
