<script lang="ts" generics="TData, TValue">
    import {
        type ColumnDef,
        type VisibilityState,
        getCoreRowModel,
        getPaginationRowModel,
        getSortedRowModel,
        type SortingState,
        type ColumnSort,
    } from "@tanstack/table-core";
    import {
        createSvelteTable,
        FlexRender,
    } from "$lib/components/ui/data-table/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Select from "$lib/components/ui/select/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import {
        ArrowUpDown,
        ArrowUp,
        ArrowDown,
        ChevronRightIcon,
        ChevronsRightIcon,
        ChevronsLeftIcon,
        ChevronLeftIcon,
    } from "@lucide/svelte";

    type DatasetColumn = { label: string; type: string; };

    type DataTableProps<TData, TValue> = {
        datasetLabel: string;
        data: TData[];
        columns: ColumnDef<TData, TValue>[];
        rowCount: number;
        pagination: { pageIndex: number; pageSize: number };
        sorting: SortingState;
        columnVisibility: VisibilityState;
        datasetColumns: DatasetColumn[];
    };

    let {
        datasetLabel,
        data,
        columns,
        rowCount,
        datasetColumns,
        pagination = $bindable(),
        sorting = $bindable(),
        columnVisibility = $bindable(),
    }: DataTableProps<TData, TValue> = $props();

    const allPossibleTableColumns: ColumnDef<TData, TValue>[] = $derived(
        datasetColumns.map(col => ({
            accessorKey: col.label,
            header: col.label,
            enableSorting: true,
            enableHiding: true,
        }))
    );

    $effect(() => {
        if (datasetColumns && datasetColumns.length > 0) {
            const currentColumnIds = Object.keys(columnVisibility);
            const datasetColumnIds = datasetColumns.map(col => col.label);

            let needsUpdate = false;
            const newVisibility: VisibilityState = { ...columnVisibility };

            datasetColumnIds.forEach(id => {
                if (!(id in newVisibility)) {
                    newVisibility[id] = true;
                    needsUpdate = true;
                }
            });

            currentColumnIds.forEach(id => {
                if (!datasetColumnIds.includes(id)) {
                    delete newVisibility[id];
                    needsUpdate = true;
                }
            });

            if (needsUpdate || Object.keys(columnVisibility).length === 0) {
                 columnVisibility = newVisibility;
            }
        }
    });

    const table = createSvelteTable({
        get data() {
            return data;
        },
        columns: allPossibleTableColumns,
        state: {
            get pagination() {
                return pagination;
            },
            get sorting() {
                return sorting;
            },
            get columnVisibility() {
                return columnVisibility;
            },
        },
        onPaginationChange: (updater) => {
            pagination = typeof updater === "function" ? updater(pagination) : updater;
        },
        onSortingChange: (updater) => {
            const newSorting = typeof updater === "function" ? updater(sorting) : updater;
            sorting = newSorting;
            pagination = { ...pagination, pageIndex: 0 };
        },
        onColumnVisibilityChange: (updater) => {
            columnVisibility = typeof updater === "function" ? updater(columnVisibility) : updater;
        },
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        rowCount,
        enableSortingRemoval: true,
        enableHiding: true,
    });

    $inspect('debug onColumnVisibilityChange: ', columnVisibility);
</script>

<div class="flex flex-col w-full px-4 max-h-[calc(100vh-70px)]">

    <div class="flex items-center py-4 flex-shrink-0">
        <h2 class="text-3xl font-bold tracking-tight">{datasetLabel}</h2>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                    <Button {...props} variant="outline" class="ml-auto"
                        >Columns</Button
                    >
                {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content class="max-h-96 overflow-y-auto" align="end">
                {#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
                    <DropdownMenu.CheckboxItem
                        class="capitalize"
                        bind:checked={
                            () => column.getIsVisible(),
                            (v) => column.toggleVisibility(!!v)
                        }
                    >
                        {column.id}
                    </DropdownMenu.CheckboxItem>
                {/each}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>

    <div class="flex grow overflow-auto rounded-md border">
        <Table.Root>
            <Table.Header>
                {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                    <Table.Row>
                        {#each headerGroup.headers as header (header.id)}
                            <Table.Head colspan={header.colSpan}>
                                {#if !header.isPlaceholder}
                                    <div class="flex items-center">
                                        <FlexRender
                                            content={header.column.columnDef
                                                .header}
                                            context={header.getContext()}
                                        />
                                        {#if header.column.getCanSort()}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                class="ml-2"
                                                onclick={() =>
                                                    header.column.toggleSorting()}
                                            >
                                                {#if header.column.getIsSorted() === "asc"}
                                                    <ArrowUp class="h-4 w-4" />
                                                {:else if header.column.getIsSorted() === "desc"}
                                                    <ArrowDown
                                                        class="h-4 w-4"
                                                    />
                                                {:else}
                                                    <ArrowUpDown
                                                        class="h-4 w-4"
                                                        color="#d1d5dc"
                                                    />
                                                {/if}
                                            </Button>
                                        {/if}
                                    </div>
                                {:else if header.isPlaceholder}
                                    <FlexRender
                                        content={header.column.columnDef.header}
                                        context={header.getContext()}
                                    />
                                {/if}
                            </Table.Head>
                        {/each}
                    </Table.Row>
                {/each}
            </Table.Header>
            <Table.Body>
                {#each table.getRowModel().rows as row (row.id)}
                    <Table.Row data-state={row.getIsSelected() && "selected"}>
                        {#each row.getVisibleCells() as cell (cell.id)}
                            <Table.Cell>
                                <FlexRender
                                    content={cell.column.columnDef.cell}
                                    context={cell.getContext()}
                                />
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell
                            colspan={columns.length}
                            class="h-24 text-center"
                        >
                            No results.
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>

    <div class="flex w-full items-center gap-8 lg:w-fit my-4 flex-shrink-0">
        <div class="hidden items-center gap-2 lg:flex">
            <Label for="rows-per-page" class="text-sm font-medium"
                >Rows per page</Label
            >
            <Select.Root
                type="single"
                bind:value={
                    () => `${table.getState().pagination.pageSize}`,
                    (v) => table.setPageSize(Number(v))
                }
            >
                <Select.Trigger size="sm" class="w-20" id="rows-per-page">
                    {table.getState().pagination.pageSize}
                </Select.Trigger>
                <Select.Content side="top">
                    {#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
                        <Select.Item value={pageSize.toString()}>
                            {pageSize}
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
        </div>
        <div class="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of
            {table.getPageCount()}
        </div>
        <div class="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
                variant="outline"
                class="h-8 w-8 p-0 flex justify-center"
                onclick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
            >
                <span class="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
            </Button>
            <Button
                variant="outline"
                class="size-8 justify-center"
                size="icon"
                onclick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                <span class="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
            </Button>
            <Button
                variant="outline"
                class="size-8 justify-center"
                size="icon"
                onclick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                <span class="sr-only">Go to next page</span>
                <ChevronRightIcon />
            </Button>
            <Button
                variant="outline"
                class="size-8 flex justify-center"
                size="icon"
                onclick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
            >
                <span class="sr-only">Go to last page</span>
                <ChevronsRightIcon />
            </Button>
        </div>
    </div>
</div>