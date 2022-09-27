<script lang="ts">
	import { password } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import { open } from '@tauri-apps/api/shell';
	import { onMount } from 'svelte';
	import { Dialog, DialogOverlay, DialogTitle } from '@rgossiaux/svelte-headlessui';
	import { createForm } from 'felte';
	import * as localForage from 'localforage';

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
		console.log(nations);

		nations.push({ name, password });

		await updateEncryptedNations(nations);
		nations = nations;
	}

	async function removeNation(index: number) {
		nations.splice(index, 1);

		await updateEncryptedNations(nations);
		nations = nations;
	}

	function getPassword(index: number) {
		return nations[index].password;
	}

	const { form } = createForm({
		onSubmit: async (values) => {
			await addNation(values.name, values.password);
			isOpen = false;
		}
	});
</script>

<div class="p-8">
	<h1 class="mt-4 mb-2 text-3xl font-bold text-amber-600 dark:text-amber-400">My Nations</h1>

	<div>
		<button type="button" on:click={() => (isOpen = true)}>Add Nation</button>
	</div>

	<Dialog
		class="fixed inset-0 z-10 overflow-y-auto"
		open={isOpen}
		on:close={() => (isOpen = false)}
	>
		<div class="min-h-screen px-4 text-center">
			<DialogOverlay class="fixed inset-0" />

			<!-- This element is to trick the browser into centering the modal contents. -->
			<span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>
			<div
				class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white border rounded-lg shadow-md transition-all transform"
			>
				<DialogTitle class="text-lg font-medium text-gray-900 leading-6">Add Nation</DialogTitle>

				<form use:form>
					<label for="name">Nation name</label>
					<input name="name" type="text" required />

					<label for="password">Password</label>
					<input name="password" type="password" required />

					<button type="submit">Submit</button>
				</form>
			</div>
		</div>
	</Dialog>

	{#if nations == null}
		Loading…
	{:else if nations.length > 0}
		{#each nations as nation, index}
			<div>
				<button on:click={() => removeNation(index)}>[x]</button>
				<button on:click={async () => await open(`https://nationstates.net/${nation.name}`)}
					><strong>{nation.name}</strong></button
				>
			</div>
		{/each}

		<a href="/prep">Start prepping</a>
	{:else}
		No nations found.
	{/if}
</div>
