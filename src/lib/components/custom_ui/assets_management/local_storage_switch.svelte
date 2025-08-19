<script>
    import { Switch } from "$lib/components/ui/switch/index.js";
    import { dataSourcesIndex } from "$lib/zelij_utils/stores";
    import { get } from 'svelte/store';
    import { existsInLocalStorage } from "$lib/zelij_utils/localStorage_stores.js";

    let { row, assetStore } = $props();
    let disabledSwitch = $state(true);
    let checkedSwitch = $state(false);

    $effect(() => {
        if (row.definition_source === "configuration file") {
            disabledSwitch = true;
        } else if (row.definition_source === "in-memory") {
            disabledSwitch = false;
            const assetExistsInLocalStorage = existsInLocalStorage(
                assetStore.storeKey,
                "name",
                row.name,
            );
            console.log('DEBUG assetExistsInLocalStorage :', assetExistsInLocalStorage);
            if (assetExistsInLocalStorage) {
                checkedSwitch = true;
            }
        }
    });

    function manageAssetInLocalStorage() {
        // const store = get(assetStore);
        if (checkedSwitch) {
            // store.persistItem(row.name)
            assetStore.persistItem(row.name)
        } else {
            // store.unpersistItem(row.name)
            assetStore.unpersistItem(row.name)
        }
    }
</script>

<Switch disabled={disabledSwitch} bind:checked={checkedSwitch} onCheckedChange={manageAssetInLocalStorage}/>