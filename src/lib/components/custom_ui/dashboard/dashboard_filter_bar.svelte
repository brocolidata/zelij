<script>
	import { getContext } from 'svelte';

	let { onRemoveFilter } = $props();

	const filtersStore = getContext('filters');
    $inspect('debug filterStore: ', $filtersStore);


	function removeFilter(filterToRemove) {
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
		onRemoveFilter(filterToRemove);
	}
</script>

<!-- {#if $filters.length > 0} -->
<!-- {#if $filtersStore.length > 0} -->
{#if $filtersStore}
	<div class="p-2 bg-gray-100 dark:bg-gray-800 border rounded flex flex-wrap gap-2">
		<span class="font-semibold text-sm">Active Filters:</span>
		<!-- {#each $filters as filter (filter.dataset + filter.column + filter.value)} -->
        {#each $filtersStore as filter}
			<div class="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-sm flex items-center gap-2 border">
				<span>{filter.column}: {filter.value}</span>
				<button onclick={() => removeFilter(filter)}>✕</button>
			</div>
		{/each}
	</div>
{/if}
