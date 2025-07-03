<script>
    import { getContext } from 'svelte';

    // Props: onRemoveFilter is a callback function passed from the parent
    let { onRemoveFilter } = $props();

    // Get the filters store from the Svelte context
    const filtersStore = getContext('filters');

    // Reactive statement to group filters for display.
    // This block re-runs whenever $filtersStore changes.
	function createFilterGroups(filtersStoreArray) {
		// If filtersStore is not yet available or empty, return an empty array
        if (!filtersStoreArray) return [];

        // Use a Map to group filters. Map is generally better for dynamic keys than plain objects.
        // The key for grouping is a combination of dataset and column to ensure uniqueness across datasets.
        const groupedMap = new Map();

        // Iterate over each filter in the store
        filtersStoreArray.forEach(filter => {
            // Create a unique key for grouping (e.g., "sales::status")
            const key = `${filter.dataset}::${filter.column}`;

            // If this group doesn't exist in the map, initialize it
            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    column: filter.column,   // Store the column name for display
                    dataset: filter.dataset, // Store the dataset name (useful for debugging/future features)
                    // Store the original filter objects. This is crucial for the `removeFilter`
                    // function to correctly identify and remove the specific filter when clicked.
                    individualFilters: []
                });
            }
            // Add the current filter object to the array of individual filters for this group
            groupedMap.get(key).individualFilters.push(filter);
        });

        // Convert the Map's values (which are our grouped filter objects) into an array
        // so we can iterate over them using Svelte's #each block.
        return Array.from(groupedMap.values());
	}

    let groupedDisplayFilters = $derived(createFilterGroups($filtersStore));

    /**
     * Removes a specific filter object from the filters store.
     * This function is called when a user clicks the '✕' next to an individual filter value.
     * @param {Object} filterToRemove - The exact filter object to remove.
     */
    function removeFilter(filterToRemove) {
        // Update the filtersStore by filtering out the exact filterToRemove object.
        // We compare all properties to ensure we're removing the correct, specific filter.
        filtersStore.update(filters =>
            filters.filter(f =>
                !(
                    f.chartID === filterToRemove.chartID &&
                    f.dataset === filterToRemove.dataset &&
                    f.column === filterToRemove.column &&
                    f.value === filterToRemove.value
                )
            )
        );
        // Call the parent component's onRemoveFilter callback, passing the removed filter.
        onRemoveFilter(filterToRemove);
    }

    /**
     * Processes the filter value based on its type for display.
     * This ensures TIMESTAMP_NS values are displayed as readable dates.
     * @param {Object} filterObj - The individual filter object (e.g., { column: 'date', value: 1672531200000, columnType: 'TIMESTAMP_NS' }).
     * @returns {string | Date} The formatted value for display.
     */
    function processValueType(filterObj) {
        if (filterObj.columnType === "TIMESTAMP_NS") {
            // Assuming filterObj.value is a timestamp (e.g., milliseconds since epoch)
            // Convert to a Date object and then format it to a locale-specific string.
            // You can customize the date formatting further if needed (e.g., toISOString(), toDateString()).
            return new Date(Number(filterObj.value)).toLocaleString();
        } else {
            // For other types, display the value directly.
            return filterObj.value;
        }
    }

</script>

<!-- Only display the filter bar if there are active filters to show -->
{#if groupedDisplayFilters.length > 0}
    <div class="p-2 bg-gray-100 dark:bg-gray-800 border rounded flex flex-wrap gap-2">
        <span class="font-semibold text-sm">Active Filters:</span>
        <!-- Iterate over each grouped filter (e.g., "status" filters, "customer" filters) -->
        {#each groupedDisplayFilters as group (group.dataset + group.column)}
            <div class="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-sm flex items-center gap-2 border">
                <!-- Display the column name for the entire group -->
                <span class="font-medium text-gray-900 dark:text-gray-100">{group.column}:</span>
                <!-- Iterate over each individual value within this group -->
                {#each group.individualFilters as filter, i}
                    <!-- Process and display the individual filter value -->
                    {@const filterValue = processValueType(filter)}
                    <span class="text-gray-700 dark:text-gray-300">{filterValue}</span>
                    <!-- Button to remove this specific filter value -->
                    <button
                        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full w-5 h-5 flex items-center justify-center"
                        aria-label="Remove filter {filter.column}: {filterValue}"
                        onclick={() => removeFilter(filter)}
                    >
                        ✕
                    </button>
                    <!-- Add a comma separator between values, but not after the last one -->
                    {#if i < group.individualFilters.length - 1}
                        <span class="text-gray-400">,</span>
                    {/if}
                {/each}
            </div>
        {/each}
    </div>
{/if}

<style>
    /* Basic styling for the remove button to make it look clickable */
    button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.9em;
        line-height: 1;
        padding: 0;
        margin-left: 0.25rem; /* Small margin to separate from value */
    }
</style>
