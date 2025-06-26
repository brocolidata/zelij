<script lang="ts">
	import { base } from '$app/paths';
	import * as Card from "$lib/components/ui/card/index.js";
	import { dataAppsIndex} from "$lib/zelij_utils/stores";
	
</script>

<div class="p-6 space-y-12">
	<!-- Dashboards Section -->
	<section>
	  <h2 class="text-2xl font-bold mb-4">Data apps</h2>
	  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each $dataAppsIndex as dataApp}
			<a href="{base}/data_app/{dataApp.name}" class="card">
				<Card.Root >
					<Card.Header>
					<Card.Title>{dataApp.label}</Card.Title>
					<!-- <Card.Description>{dashboard.description}</Card.Description> -->
					</Card.Header>
					<Card.Content>
						<p class="text-sm font-medium leading-none">{dataApp.description}</p>
					</Card.Content>
					<Card.Footer>
						<p class="text-muted-foreground text-sm">{dataApp.definition_source}</p>
					</Card.Footer>
				</Card.Root>
			</a>
		{/each}
	  </div>
	</section>
  
  </div>
  
  <!-- <style>
	/* Example custom card styling */
	.card:hover {
	  @apply shadow-lg transform scale-105 transition duration-300;
	}
  </style> -->