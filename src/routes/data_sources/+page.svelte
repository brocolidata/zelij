<script lang="ts">
    import { base } from "$app/paths";
    import * as Card from "$lib/components/ui/card/index.js";
    import { dataSourcesIndex, dataLoaded } from "$lib/zelij_utils/stores";

    $inspect("DEBUG dataSourcesIndex: ", $dataSourcesIndex);
    $inspect("DEBUG dataLoaded: ", $dataLoaded);
</script>

<div class="p-6 space-y-12">
    <section>
        <h2 class="text-2xl font-bold mb-4">Data Sources</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {#if $dataLoaded}
                {#each $dataSourcesIndex as dataSource}
                    <a href="{base}/data_sources/{dataSource.name}" class="card">
                        <Card.Root>
                            <Card.Header>
                                <Card.Title>{dataSource.label}</Card.Title>
                                <!-- <Card.Description>{dashboard.description}</Card.Description> -->
                            </Card.Header>
                            <Card.Content>
                                <p class="text-sm font-medium leading-none">{dataSource?.description || " "}</p>
                            </Card.Content>
                            <Card.Footer>
                                <p class="text-muted-foreground text-sm">{dataSource?.path || 'in-memory'}</p>
                            </Card.Footer>
                        </Card.Root>
                    </a>
                {/each}
            {/if}
        </div>
    </section>
</div>
