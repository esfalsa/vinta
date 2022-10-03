<script lang="ts">
	import { password, selected, nations } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import { onMount } from 'svelte';
	import * as localForage from 'localforage';
	import Button from '$lib/components/Button.svelte';
	import Table from '$lib/components/Table.svelte';
	import PrepDialog from '$lib/components/PrepDialog.svelte';
	import AddNationDialog from '$lib/components/AddNationDialog.svelte';

	// let nations: Nation[];

	let showAddNationDialog = false;
	let showPrepDialog = false;

	onMount(async () => {
		const encryptedNations = (await localForage.getItem('nations')) ?? [];
		const salt = await localForage.getItem('salt');
		const nonce = await localForage.getItem('nonce');

		$nations =
			JSON.parse(
				await invoke('decrypt', {
					data: encryptedNations,
					password: $password,
					salt: salt,
					nonce: nonce
				})
			) || [];

		console.log($nations);
	});

	async function updateEncryptedNations(nations: Nation[]) {
		let salt = await localForage.getItem('salt');
		if (!salt) {
			salt = await invoke('generate_salt');
			localForage.setItem('salt', salt);
		}

		const [encrypted, nonce] = await invoke<[number[], number[]]>('encrypt', {
			data: JSON.stringify(nations),
			password: $password,
			salt: salt
		});
		await localForage.setItem('nations', encrypted);
		await localForage.setItem('nonce', nonce);
	}

	async function removeNation(index: number) {
		$nations.splice(index, 1);

		await updateEncryptedNations($nations);
		$nations = $nations;
	}

	async function removeNations(indices: number[]) {
		for (let i = indices.length - 1; i >= 0; i--) {
			$nations.splice(indices[i], 1);
			$selected = [
				...$selected.slice(0, indices[i]),
				...$selected.slice(indices[i] + 1).map((index) => index - 1)
			];
		}

		await updateEncryptedNations($nations);
		$nations = $nations;
	}

	function getPassword(index: number) {
		return $nations[index].password;
	}

	const columns = [
		{
			accessorKey: 'name',
			header: () => 'Nation Name'
		}
	];
</script>

<div class="flex w-full h-screen">
	<!-- <div class="w-96 bg-stone-100 flex-0 flex flex-col h-full p-8">
		<Button type="button" on:click={() => (isOpen = true)}>Add Nation</Button>
	</div> -->
	<div class="flex-1 shadow-lg">
		<div class="flex flex-row p-6 shadow">
			<div class="space-x-6">
				<Button type="button" on:click={() => (showAddNationDialog = true)}>Add Nation</Button>
				<Button
					color="light"
					disabled={$selected.length === 0}
					on:click={() => (showPrepDialog = true)}>Prep Selected</Button
				>
				<Button
					color="light"
					disabled={$selected.length === 0}
					on:click={() => {
						removeNations($selected);
					}}
				>
					Delete Selected
				</Button>
			</div>
			<div class="ml-auto flex items-center">
				<a href="/preferences" class="text-orange-400">Preferences</a>
			</div>
		</div>
		<div class="p-8">
			{#if $nations == null}
				Loading nations…
			{:else if $nations.length > 0}
				<Table bind:data={$nations} {columns} bind:selected={$selected} />
			{:else}
				No nations found. <button
					on:click={() => (showAddNationDialog = true)}
					class="text-orange-400"
					>Add one
				</button> to get started!
			{/if}
		</div>
	</div>
</div>

<AddNationDialog bind:open={showAddNationDialog} on:close={() => (showAddNationDialog = false)} />

<PrepDialog bind:open={showPrepDialog} on:close={() => (showPrepDialog = false)} />
