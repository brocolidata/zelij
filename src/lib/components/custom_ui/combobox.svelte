<script lang="ts">
    import Check from "@lucide/svelte/icons/check";
    import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
    import { tick } from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import { cn } from "$lib/utils.js";

    let { 
        boxOptions, 
        objectName, 
        value=$bindable()
    } = $props();
    let open = $state(false);
    let triggerRef = $state<HTMLButtonElement>(null!);
    let selectedValue = $derived(
        boxOptions.find((o) => o.value === value)?.label,
    );

    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger() {
        open = false;
        tick().then(() => {
            triggerRef.focus();
        });
    }
</script>
<!-- class="w-[200px] justify-between" -->
<Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
        {#snippet child({ props })}
            <Button
                variant="outline"
                {...props}
                role="combobox"
                aria-expanded={open}
            >
                <span class="truncate">
                    {selectedValue || `Select ${objectName}`}
                </span>
                <ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
            
            <!-- <button
                class={buttonVariants({ variant: "outline", size: "default" })}
                aria-expanded={open}
                data-slot="button"
                role="combobox"
                {...props}
                type="button"
            >
                 <span class="truncate">
                    {selectedValue || `Select ${objectName}`}
                </span>
                <ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
            </button> -->
        {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-full p-0">
        <Command.Root>
            <Command.Input placeholder="Search {objectName}..." />
            <Command.List>
                <Command.Empty>No {objectName} found.</Command.Empty>
                <Command.Group value="options">
                    {#each boxOptions as option (option.value)}
                        <Command.Item
                            value={option.value}
                            onSelect={() => {
                                value = option.value;
                                closeAndFocusTrigger();
                            }}
                        > 
                            {#if option.icon}
                                {@const Icon = option.icon}
                                <Icon class="mr-2 size-3"/>
                            {/if}
                            {option.label}
                            <Check
                                class={cn(
                                    "mr-2 size-4",
                                    value !== option.value &&
                                        "text-transparent",
                                )}
                            />
                        </Command.Item>
                    {/each}
                </Command.Group>
            </Command.List>
        </Command.Root>
    </Popover.Content>
</Popover.Root>
