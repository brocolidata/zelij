<script>
    import Combobox from "$custom_ui/combobox.svelte";
    import Button from "$lib/components/ui/button/button.svelte";

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

    // $inspect('Chart series item chartDataColumns', chartDataColumns);
    // $inspect('Chart series item columnOptions', columnOptions);

    function removeItem() {
        onRemove();
    }

</script>

<div class="flex items-end gap-2">
    <div class="flex flex-col w-2/4 space-y-1">
        <Combobox
            boxOptions={columnOptions}
            objectName="data column"
            bind:value={series.column}
        />
    </div>
    <div class="flex flex-col w-2/6 space-y-1">
        <Combobox
            boxOptions={chartTypes}
            objectName="chart type"
            bind:value={series.type}
        />
    </div>
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
