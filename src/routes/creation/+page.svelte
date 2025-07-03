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

	let isDataAppDialogOpen = $state(false);
	let dataAppLabel = $state("My Data App"); 
	let dataAppName = $derived(labelToName(dataAppLabel));
	let dataAppDescription = $state("A description for My Data App");

	function saveDataApp() {
		createDataApp(
			{
				name: dataAppName, 
				label: dataAppLabel,
				description: dataAppDescription,
				definition_source: "in memory"
			}
		);
		goto(`${base}/data_app/${dataAppName}`);
	}
</script>

<div class="p-6 space-y-12">
	<section>
        <h2 class="text-2xl font-bold mb-4">Create</h2>
	    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <a onclick={() => (isDataAppDialogOpen = true)} class="card">
				<Card.Root >
					<Card.Header>
					    <Card.Title>New Data App</Card.Title>
					    <Card.Description>Create an in-memory data app</Card.Description>
					</Card.Header>
					<Card.Content>
						<!-- <p class="text-sm font-medium leading-none">{dashboard.description}</p> -->
					</Card.Content>
					<Card.Footer>
						<!-- <p class="text-muted-foreground text-sm">{dashboard.definition_source}</p> -->
					</Card.Footer>
				</Card.Root>
			</a>
		<Dialog.Root bind:open={isDataAppDialogOpen}>
				<Dialog.Content class="sm:max-w-[425px]">
				  <Dialog.Header>
					<Dialog.Title>Create new data app</Dialog.Title>
					<!-- <Dialog.Description>
					  Make changes to your profile here. Click save when you're done.
					</Dialog.Description> -->
				  </Dialog.Header>
				  <div class="grid gap-4 py-4">
					<div class="grid grid-cols-4 items-center gap-4">
					  <Label for="label" class="text-right">Label</Label>
					  <Input id="label" bind:value={dataAppLabel} class="col-span-3" />
					</div>
					<div class="grid grid-cols-4 items-center gap-4">
					  <Label for="description" class="text-right">Description</Label>
					  <Input id="description" bind:value={dataAppDescription} class="col-span-3" />
					</div>
				  </div>
				  <Dialog.Footer>
					<Button onclick={saveDataApp} type="submit">Save</Button>
				  </Dialog.Footer>
				</Dialog.Content>
			  </Dialog.Root>
            <a href="{base}/dashboard/new" class="card">
				<Card.Root >
					<Card.Header>
					<Card.Title>New Dashboard</Card.Title>
					<Card.Description>Create an in-memory dashboard</Card.Description>
					</Card.Header>
					<Card.Content>
						<!-- <p class="text-sm font-medium leading-none">{dashboard.description}</p> -->
					</Card.Content>
					<Card.Footer>
						<!-- <p class="text-muted-foreground text-sm">{dashboard.definition_source}</p> -->
					</Card.Footer>
				</Card.Root>
			</a>
	    </div>
	</section>
</div>