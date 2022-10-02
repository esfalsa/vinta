<script lang="ts">
	import { writable } from 'svelte/store';
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';
	import type { ColumnDef, TableOptions } from '@tanstack/svelte-table';
	import Input from './Input.svelte';

	type T = $$Generic;

	export let data: T[];
	export let columns: ColumnDef<T>[];

	export let selected = [];

	const options = writable<TableOptions<T>>({
		data: data,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		enableRowSelection: true,
		enableMultiRowSelection: true
	});

	$: data,
		($options = {
			...$options,
			data: data,
			initialState: $table?.getState()
		});
	$: table = createSvelteTable($options);

	$: selected = $table?.getSelectedRowModel().rows.map((row) => row.index) || [];
</script>

<div class="overflow-hidden overflow-x-auto border border-stone-200 rounded-lg">
	<table class="min-w-full divide-y divide-stone-200">
		<thead class="bg-stone-100">
			{#each $table.getHeaderGroups() as headerGroup}
				<tr>
					<th class="inset-y-0 left-0 px-4 py-2 text-left bg-stone-100 w-px">
						<Input
							type="checkbox"
							checked={$table.getIsAllRowsSelected()}
							indeterminate={$table.getIsSomeRowsSelected()}
							on:change={() => $table.toggleAllRowsSelected()}
						/>
					</th>
					{#each headerGroup.headers as header}
						<th class="px-4 py-2 font-medium text-left text-stone-900 whitespace-nowrap">
							{#if !header.isPlaceholder}
								<svelte:component
									this={flexRender(header.column.columnDef.header, header.getContext())}
								/>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody class="divide-y divide-stone-200">
			{#each $table.getRowModel().rows as row}
				<tr class={row.getIsSelected() ? 'bg-orange-100' : ''}>
					<td class="inset-y-0 left-0 px-4 py-2">
						<Input
							type="checkbox"
							checked={row.getIsSelected()}
							on:change={() => row.toggleSelected()}
						/>
					</td>
					{#each row.getVisibleCells() as cell}
						<td class="px-4 py-2 text-stone-700 whitespace-nowrap">
							<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
		<tfoot>
			{#each $table.getFooterGroups() as footerGroup}
				<tr>
					{#each footerGroup.headers as header}
						<th>
							{#if !header.isPlaceholder}
								<svelte:component
									this={flexRender(header.column.columnDef.footer, header.getContext())}
								/>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</tfoot>
	</table>
</div>
