<script>
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import SlidersHorizontal from "@lucide/svelte/icons/sliders-horizontal";

    let {
        chartProperties = $bindable(),
    } = $props();

    let chartLabel = $state(chartProperties?.label || "");
    let chartDescription = $state(chartProperties?.description || "");

    $effect(() => {
        chartProperties = {label: chartLabel, description: chartDescription}
    })
    
    
</script>

<div class="grid gap-2 mb-4">
    <div class="grid grid-cols-3 items-center gap-4">
        <Label for="chart_label" class="text-right text-sm font-medium text-gray-700 dark:text-gray-100">Chart label</Label>
        <Input id="chart_label" bind:value={chartLabel} class="col-span-2 h-8 rounded-md border shadow-sm focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 text-sm text-gray-900 dark:text-gray-100" />
    </div>
</div>

<Popover.Root>
    <Popover.Trigger class={buttonVariants({ variant: "secondary" })}>
        <SlidersHorizontal class="mr-2 size-4" />
        Chart properties
    </Popover.Trigger>
    <Popover.Content class="w-80 mt-2 p-4 bg-white dark:bg-gray-800 border rounded-md shadow-md">
        <div class="grid gap-4">
            <div class="space-y-2">
                <p class="text-muted-foreground text-sm text-gray-500 dark:text-gray-400">
                    Chart properties
                </p>
            </div>
            <div class="grid gap-2">
                <div class="grid grid-cols-3 items-center gap-4">
                    <Label for="chart_description" class="text-right text-sm font-medium text-gray-700 dark:text-gray-100">Description</Label>
                    <Input id="chart_description" bind:value={chartDescription} class="col-span-2 h-8 rounded-md border shadow-sm focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 text-sm text-gray-900 dark:text-gray-100" />
                </div>
            </div>
        </div>
    </Popover.Content>
</Popover.Root>