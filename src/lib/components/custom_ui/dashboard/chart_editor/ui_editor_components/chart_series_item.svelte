<script>
    import Combobox from "$custom_ui/combobox.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
    import { Hash, Dot, Euro } from '@lucide/svelte';


    let {
        series = $bindable(),
        columnOptions,
        onRemove
    } = $props();

    const chartTypes = [
        { label: "Line", value: "line" },
        { label: "Bar", value: "bar" },
        { label: "Area", value: "area" },
    ];

    const numberFormats = [
        { label: "Currency", value: "currency", icon: Euro },
        { label: "Integer", value: "integer", icon: Hash },
        { label: "Decimals", value: "decimals", icon: Dot },
    ];

    function removeItem() {
        onRemove();
    }

    // // Ensure number_format is initialized if undefined
    // $: if (!series.number_format) {
    //     series.number_format = { type: "integer" };
    // }
</script>

<div class="flex flex-wrap items-end gap-0.5">
    <div class="flex flex-col w-3/10 space-y-1">
        <Combobox
            boxOptions={columnOptions}
            objectName="data column"
            bind:value={series.column}
        />
    </div>

    <div class="flex flex-col w-2/10 space-y-1">
        <Combobox
            boxOptions={chartTypes}
            objectName="chart type"
            bind:value={series.type}
        />
    </div>

    <div class="flex flex-col w-3/10 space-y-1">
        <Combobox
            boxOptions={numberFormats}
            objectName="number format"
            bind:value={series.number_format.type}
        />
    </div>

    {#if series.number_format?.type === 'currency'}
        <div class="flex flex-col w-1/12 space-y-1">
            <Input
                label="Currency"
                bind:value={series.number_format.currency}
                placeholder="€"
            />
        </div>
    {/if}

    {#if series.number_format?.type === 'decimals'}
        <div class="flex flex-col w-1/12 space-y-1">
            <Input
                label="Decimals"
                type="number"
                min="0"
                max="10"
                bind:value={series.number_format.decimals}
            />
        </div>
    {/if}

    <Button
        variant="ghost"
        size="icon"
        class="text-red-500 justify-center"
        onclick={removeItem}
        aria-label="Remove series item"
    >
        ✕
    </Button>
</div>
