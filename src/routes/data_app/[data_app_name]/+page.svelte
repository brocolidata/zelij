<script>
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { base } from "$app/paths";
	import * as Card from "$lib/components/ui/card/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import { Ellipsis, Plus, FileSymlink } from "@lucide/svelte";
	import ExportConfigDrawer from "$custom_ui/export_config_drawer.svelte";
	import {
		getDataAppByName,
		getDashboardsForDataApp,
		dashboardsIndex,
		updateDashboardsInDataApp,
	} from "$lib/zelij_utils/stores";

	const dataAppName = page.params.data_app_name;
	let dataApp = $state({});
	let dashboards = $state([]);
	let selectedDashboards = $state([]);
	let openExportConfigDrawer = $state(false);
	let openDashboardSelectDialog = $state(false);
	let dataSourceExport = $derived({
		data_apps: [
			{
				name: dataAppName,
				label: dataApp.label,
				description: "",
				dashboards: dashboards.map((d) => d.name),
			},
		],
		dashboards: dashboards.map(({ definition_source, ...rest }) => rest),
	});

	onMount(() => {
		dataApp = getDataAppByName(dataAppName);
		dashboards = getDashboardsForDataApp(dataApp?.dashboards) || [];
	});

	function saveDataApp() {
		updateDashboardsInDataApp(dataAppName, selectedDashboards);
		dashboards = getDashboardsForDataApp(selectedDashboards);
		openDashboardSelectDialog = false;
	}
</script>

<div class="flex items-center">
	<h2 class="text-3xl font-bold tracking-tight p-4">{dataApp.label}</h2>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="{buttonVariants({ variant: "ghost", size: "icon" })} justify-center"
		>
			<Ellipsis />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Group>
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<!-- <span>Edit</span> -->
						<Plus class="mr-2 size-4" />
						<a
							href="{base}/data_app/{dataAppName}/dashboard/new"
							class="w-full block">Create dashboard</a
						>
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onSelect={() => (openExportConfigDrawer = true)}
					>
						<FileSymlink class="mr-2 size-4" />
						Export
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onSelect={() => (openDashboardSelectDialog = true)}
					>
						<FileSymlink class="mr-2 size-4" />
						Manage dashboards
					</DropdownMenu.Item>
				</DropdownMenu.Group>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<ExportConfigDrawer
		dashboardExport={dataSourceExport}
		bind:isOpen={openExportConfigDrawer}
	/>
	<Dialog.Root bind:open={openDashboardSelectDialog}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Manage dashboards</Dialog.Title>
				<Dialog.Description>
					Select the dashboards that belong to the {dataAppName} data app
				</Dialog.Description>
			</Dialog.Header>
			<Select.Root bind:value={selectedDashboards} type="multiple">
				<Select.Trigger class="w-[180px]"
					>Select Dashboards</Select.Trigger
				>
				<Select.Content>
					{#each $dashboardsIndex as dashboard}
						<Select.Item value={dashboard.name}
							>{dashboard.label}</Select.Item
						>
					{/each}
				</Select.Content>
			</Select.Root>
			<Button onclick={saveDataApp} class="justify-center" type="submit">Save</Button>
		</Dialog.Content>
	</Dialog.Root>
</div>

<div class="p-6 space-y-12">
	<section>
		<h2 class="text-2xl font-bold mb-4">Dashboards</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each dashboards as dashboard}
				{@const definition_source = dashboard?.definition_source || "in-memory"}
				{@const description = dashboard?.description || " "}

				<a
					href="{base}/data_app/{dataAppName}/dashboard/{dashboard.name}"
					class="card"
				>
					<Card.Root>
						<Card.Header>
							<Card.Title>{dashboard.label}</Card.Title>
							<!-- <Card.Description>{dashboard.description}</Card.Description> -->
						</Card.Header>
						<Card.Content>
							<p class="text-sm font-medium leading-none">
								{description}
							</p>
						</Card.Content>
						<Card.Footer>
							<p class="text-muted-foreground text-sm">
								{definition_source}
							</p>
						</Card.Footer>
					</Card.Root>
				</a>
			{/each}
		</div>
	</section>
</div>
