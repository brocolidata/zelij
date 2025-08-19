<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import * as Card from "$lib/components/ui/card/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import Label from "$lib/components/ui/label/label.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { createDataApp } from "$lib/zelij_utils/stores";
	import {
        labelToName
    } from "$lib/zelij_utils/grid_utils";

    let {
        dataAppDialogIsOpen = $bindable(),
    } = $props();

	let dataAppLabel = $state("My Data App"); 
	let dataAppName = $derived(labelToName(dataAppLabel));
	let dataAppDescription = $state("A description for My Data App");

	function saveDataApp() {
		createDataApp(
			{
				name: dataAppName, 
				label: dataAppLabel,
				description: dataAppDescription,
				definition_source: "in-memory"
			}
		);
		goto(`${base}/data_app/${dataAppName}`);
	}
</script>

<Dialog.Root bind:open={dataAppDialogIsOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Create new data app</Dialog.Title>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="label" class="text-right">Label</Label>
                <Input
                    id="label"
                    bind:value={dataAppLabel}
                    class="col-span-3"
                />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="description" class="text-right">Description</Label>
                <Input
                    id="description"
                    bind:value={dataAppDescription}
                    class="col-span-3"
                />
            </div>
        </div>
        <Dialog.Footer>
            <Button onclick={saveDataApp} type="submit">Save</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
