<script>
    import { Ellipsis, X } from "@lucide/svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { deleteAsset } from "$lib/zelij_utils/stores";

    let { row, assetType } = $props();
    $inspect('DEBUG row: ', row);
</script>

<DropdownMenu.Root>
    <DropdownMenu.Trigger>
        {#snippet child({ props })}
            <Button
                {...props}
                variant="ghost"
                size="icon"
                class="relative justify-center size-8 p-0"
            >
                <Ellipsis />
            </Button>
        {/snippet}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content>
        <DropdownMenu.Group>
            <DropdownMenu.Label>Actions</DropdownMenu.Label>
            {#if row.definition_source === 'in-memory'}
                <DropdownMenu.Item
                    onclick={() => deleteAsset(assetType, row.name)}
                >
                <X color='#fb2c36'/>
                Delete from session
            </DropdownMenu.Item>    
            {/if}
            
            
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
    </DropdownMenu.Content>
</DropdownMenu.Root>
