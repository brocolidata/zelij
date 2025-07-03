<script>
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import AdvancedEditor from "$custom_ui/dashboard/chart_editor/advanced_editor.svelte";
    import UiEditor from "$custom_ui/dashboard/chart_editor/ui_editor.svelte";

    let {
        remove,
        chartConfiguration = $bindable(),
        onSave
    } = $props();
    let chartConfigurationType = $state(chartConfiguration?.type || "ui");

    function saveChart() {
        chartConfiguration.type = chartConfigurationType;
        onSave();
    }

    function switchEditor() {
        chartConfiguration.type = chartConfigurationType;
    }
</script>

<div class="bg-gray-100 dark:bg-gray-600 shadow p-4">
    <Sheet.Root>
        <div class="tile-top-bar absolute top-2 right-2 flex items-center">
            <Sheet.Trigger class="mr-2">Edit</Sheet.Trigger>
            <button
                onpointerdown={(e) => e.stopPropagation()}
                onclick={() => remove()}
                class="remove"
            >
                ✕
            </button>
        </div>

        <Tabs.Root bind:value={chartConfigurationType} onchange={switchEditor}>
            <Sheet.Content 
                class="h-full max-h-screen sm:h-auto w-screen sm:max-w-md"
            >
                <Sheet.Header class="flex-shrink-0">
                        <Tabs.List>
                            <Tabs.Trigger value="ui">UI Editor</Tabs.Trigger>
                            <Tabs.Trigger value="advanced">Advanced Editor</Tabs.Trigger>
                        </Tabs.List>
                </Sheet.Header>
                <div class="flex-grow overflow-y-auto p-4">
                    <Tabs.Content value="ui">
                        <UiEditor bind:configuration={chartConfiguration.configuration} onSave={saveChart} />
                    </Tabs.Content>

                    <Tabs.Content value="advanced">
                        <AdvancedEditor bind:configuration={chartConfiguration.configuration} onSave={saveChart} />
                    </Tabs.Content>
                </div>
            </Sheet.Content>
        </Tabs.Root>
    </Sheet.Root>
</div>
