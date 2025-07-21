<script>
    import { Label } from "$lib/components/ui/label/index.js";
    import Button from "$lib/components/ui/button/button.svelte";
    import { buttonVariants } from "$lib/components/ui/button/index.js";
    import Combobox from "$custom_ui/combobox.svelte";
    import * as Collapsible from "$lib/components/ui/collapsible/index.js";
    import {
        ChevronDown,
        ChevronUp,
        Hash,
        CaseSensitive,
        CalendarDays,
        Move3d,
    } from "@lucide/svelte";

    let {
        columnOptions,
        dimensionConfiguration = $bindable(),
    } = $props();

    let mainDimension = $state(dimensionConfiguration?.main || "");
    let mainDimensionType = $state(dimensionConfiguration?.main_type || "");
    let secondaryDimension = $state(dimensionConfiguration?.secondary || "");
    let secondaryDimensionType = $state(
        dimensionConfiguration?.secondary_type || "",
    );

    const dataTypeIcons = {
        BIGINT: Hash,
        DOUBLE: Hash,
        VARCHAR: CaseSensitive,
        TIMESTAMP_NS: CalendarDays,
    };

    let displaySecondaryDimBox = $state(
        dimensionConfiguration?.secondary ? true : false,
    );
    let collapsibleisOpen = $state(true);
    let columnOptionsWithIcons = $derived(
        addIconsToColumnOptions(columnOptions, dataTypeIcons),
    );
    $effect(() => {
        const columnObj = columnOptions.find(
            ({ value }) => value === mainDimension,
        );
        mainDimensionType = columnObj?.type;
        dimensionConfiguration.main = mainDimension;
    });
    $effect(() => {
        const columnObj = columnOptions.find(
            ({ value }) => value === secondaryDimension,
        );
        secondaryDimensionType = columnObj?.type;
        dimensionConfiguration.secondary = secondaryDimension;
    });

    function removeSecondary() {
        displaySecondaryDimBox = false;
        dimensionConfiguration.secondary = "";
    }

    /**
     * Adds icon properties to column options based on their data type.
     *
     * @param {Array<Object>} columnOptions - An array of objects, where each object has 'value', 'label', and 'type' keys.
     * @param {Object} dataTypeIcons - An object mapping data types (keys) to their corresponding icons (values).
     * @returns {Array<Object>} A new array of column options with the 'icon' property added.
     */
    function addIconsToColumnOptions(columnOptionsArray, dataTypeIconsObject) {
        // Use map to create a new array without modifying the original columnOptions
        return columnOptionsArray.map((option) => {
            // Check if the 'type' exists as a key in dataTypeIcons
            const icon = dataTypeIconsObject[option.type];

            // Return a new object with all existing properties and the new 'icon' property
            return {
                ...option, // Spread existing properties (value, label, type)
                icon: icon || null, // Add the icon, or null if no matching icon is found
            };
        });
    }
</script>

<!-- UI -->
<Collapsible.Root bind:open={collapsibleisOpen}>
    <div class="flex items-center justify-between space-x-4">
        <div class="mt-4 mb-2 flex items-center gap-2">
            <Move3d size={16} />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Dimensions
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
        <!-- Main Dimension -->
        <div class="mt-4 space-y-3">
            <Label>Primary Dimension</Label>
            <Combobox
                boxOptions={columnOptionsWithIcons}
                objectName="dimension"
                bind:value={mainDimension}
            />
        </div>

        <!-- Optional Secondary Dimension -->
        {#if mainDimension !== ""}
            {#if displaySecondaryDimBox}
                <div class="mt-4 flex items-end gap-2">
                    <!-- Secondary dimension Combobox -->
                    <div class="flex-1 space-y-3">
                        <Label>Secondary Dimension</Label>
                        <Combobox
                            boxOptions={columnOptions}
                            objectName="dimension"
                            bind:value={secondaryDimension}
                        />
                    </div>

                    <!-- Remove button -->
                    <Button
                        variant="ghost"
                        size="icon"
                        class="text-red-500 justify-center"
                        onclick={removeSecondary}
                        aria-label="Remove secondary dimension"
                    >
                        ✕
                    </Button>
                </div>
            {:else}
                <Button
                    variant="link"
                    class="mt-2"
                    onclick={() => (displaySecondaryDimBox = true)}
                >
                    + Add a dimension
                </Button>
            {/if}
        {/if}
    </Collapsible.Content>
</Collapsible.Root>
