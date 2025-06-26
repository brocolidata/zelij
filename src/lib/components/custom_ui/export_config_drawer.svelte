<script>
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import { Copy } from "@lucide/svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import YAML from 'yaml';
    import YAMLEditor from "$custom_ui/code_editor/json.svelte";

    let { 
        dashboardExport, 
        isOpen=$bindable() 
    } = $props();
    let dashboardStateString = $derived(convertJsonToYaml(dashboardExport));
    
    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(dashboardStateString);
            // You can add some visual feedback here, like a toast notification
            console.log("YAML copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy: ", err);
            // Handle the error, perhaps show an error message to the user
        }
    }

    function convertJsonToYaml(jsonData) {
        try {
            const parsedYAML = YAML.stringify(jsonData, { indent: 2 });
            return parsedYAML
        } catch (error) {
            console.log("Error parsing YAML:", error.message);
        }
    }

</script>

<Sheet.Root bind:open={isOpen}>
<Sheet.Content >
    <Sheet.Header>
        <Sheet.Title>Configuration YAML</Sheet.Title>
        <Sheet.Description>
            You can copy/paste this to a Open Data Viz YAML file
        </Sheet.Description>
    </Sheet.Header>
    <div class="px-2 py-6 overflow-auto h-96">
        <YAMLEditor 
            content={dashboardStateString} 
            isReadOnly={true}
        />
    </div>
    <Button variant="secondary" onclick={copyToClipboard}>
        <Copy class="mr-2 size-4" />
        Copy to clipboard
    </Button>    
    

</Sheet.Content>
</Sheet.Root>