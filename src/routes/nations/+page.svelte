<script lang="ts">
	import { password, selected } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import { open } from '@tauri-apps/api/shell';
	import { onMount } from 'svelte';
	import { createForm } from 'felte';
	import * as localForage from 'localforage';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import Table from '$lib/components/Table.svelte';

	let nations: Nation[];

	let isOpen = false;

	onMount(async () => {
		const encryptedNations = (await localForage.getItem('nations')) ?? [];
		const salt = await localForage.getItem('salt');
		const nonce = await localForage.getItem('nonce');

		nations =
			JSON.parse(
				await invoke('decrypt', {
					data: encryptedNations,
					password: $password,
					salt: salt,
					nonce: nonce
				})
			) || [];
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

	async function addNation(name: string, password: string) {
		nations.push({ name, password });

		await updateEncryptedNations(nations);
		nations = nations;
	}

	async function removeNation(index: number) {
		nations.splice(index, 1);

		await updateEncryptedNations(nations);
		nations = nations;
	}

	async function removeNations(indices: number[]) {
		for (let i = indices.length; i >= 0; i--) {
			nations.splice(indices[i], 1);
		}

		await updateEncryptedNations(nations);
		nations = nations;
	}

	function getPassword(index: number) {
		return nations[index].password;
	}

	const { form, isSubmitting } = createForm({
		onSubmit: async (values) => {
			await addNation(values.name, values.password);
			isOpen = false;
		}
	});

	const columns = [
		{
			accessorKey: 'name',
			header: () => 'Nation Name'
		}
	];

	$: console.log($selected);
</script>

<div class="flex w-full h-screen">
	<!-- <div class="w-96 bg-stone-100 flex-0 flex flex-col h-full p-8">
		<Button type="button" on:click={() => (isOpen = true)}>Add Nation</Button>
	</div> -->
	<div class="flex-1 shadow-lg">
		<div class="flex flex-row p-6 space-x-6 shadow">
			<Button type="button" on:click={() => (isOpen = true)}>Add Nation</Button>
			<Button
				color="light"
				disabled={$selected.length === 0}
				href={$selected.length ? '/prep' : undefined}>Prep Selected</Button
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
		<div class="p-8">
			{#if nations == null}
				Loading nations…
			{:else if nations.length > 0}
				<Table bind:data={nations} {columns} bind:selected={$selected} />
			{:else}
				No nations found. <button on:click={() => (isOpen = true)} class="text-orange-400"
					>Add one
				</button> to get started!
			{/if}
		</div>
	</div>
</div>

<Dialog open={isOpen} on:close={() => (isOpen = false)} title="Add Nation">
	<form use:form>
		<div>
			<label class="text-stone-700 font-medium" for="name">Nation name</label>
			<Input class="mt-0.5 w-full" name="name" id="name" type="text" required />
		</div>

		<div class="mt-2">
			<label class="text-stone-700 font-medium" for="password">Password</label>
			<Input class="mt-0.5 w-full" name="password" id="password" type="password" required />
		</div>

		<div class="mt-6 space-x-2">
			<Button type="submit" disabled={$isSubmitting}>Submit</Button>
			<Button color="light" on:click={() => (isOpen = false)}>Cancel</Button>
		</div>
	</form>
</Dialog>
