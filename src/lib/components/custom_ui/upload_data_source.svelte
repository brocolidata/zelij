<script>
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { uploadParquetToTable } from "$lib/zelij_utils/duckdb";
    import { createDataSource } from "$lib/zelij_utils/stores"
    import { labelToName } from "$lib/zelij_utils/grid_utils";

    let { uploadDataSourceDialogIsOpen } = $props();

    let file = $state();
    let fileLabel = $state("");
    let fileName = $derived(labelToName(fileLabel))

    function handleDrop(event) {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith(".parquet")) {
            file = droppedFile;
            fileLabel = droppedFile.name.replace(/\.parquet$/i, "");
        } else {
            alert("Please upload a .parquet file");
        }
    }

    function handleFileSelect(event) {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.name.endsWith(".parquet")) {
            file = selectedFile;
            fileLabel = selectedFile.name.replace(/\.parquet$/i, "");
        } else {
            alert("Please upload a .parquet file");
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    async function handleSave() {
        if (!file) {
            alert("Please select a .parquet file before saving");
            return;
        }
        // process your file here (DuckDB WASM, etc.)
        console.log("File ready:", file);
        await uploadParquetToTable(file, fileName);
        await createDataSource(file, fileName, fileLabel);
        uploadDataSourceDialogIsOpen = false;
    }
</script>

<Dialog.Root bind:open={uploadDataSourceDialogIsOpen}>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Upload data source</Dialog.Title>
            <Dialog.Description>
                Upload a data source in .parquet format
            </Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="name" class="text-right">Label</Label>
                <Input bind:value={fileLabel} id="name" class="col-span-3" />
                <Label for="name" class="text-right">Name</Label>
                <Input disabled bind:value={fileName} id="name" class="col-span-3" />
            </div>

            <!-- Drag and Drop Zone -->
            <div
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                ondrop={handleDrop}
                ondragover={handleDragOver}
                onclick={() => document.getElementById("fileInput").click()}
            >
                <input
                    id="fileInput"
                    type="file"
                    accept=".parquet"
                    class="hidden"
                    onchange={handleFileSelect}
                />
                {#if file}
                    <p class="text-sm text-gray-700">Selected: {file.name}</p>
                {:else}
                    <p class="text-sm text-gray-500">
                        Drag & drop your .parquet file here, or click to select
                    </p>
                {/if}
            </div>
        </div>

        <Dialog.Footer>
            <Button type="button" onclick={handleSave}>Save</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
