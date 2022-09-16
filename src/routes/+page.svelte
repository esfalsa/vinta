<script lang="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import { open } from '@tauri-apps/api/shell';
	import { onMount } from 'svelte';
	import {
		Dialog,
		DialogOverlay,
		DialogTitle,
		DialogDescription
	} from '@rgossiaux/svelte-headlessui';
	import { createForm } from 'felte';
	import * as localForage from 'localforage';

	type Nation = {
		name: string;
		salt: string;
		nonce: number[];
		password: number[];
	};

	let nations: { [key: string]: Nation };

	let masterPassword = 'hunter2';

	let isOpen = false;

	onMount(async () => {
		nations = (await localForage.getItem('nations')) ?? {};
		console.log('nations', nations);
	});

	async function addNation(name: string, nationPassword: string) {
		const id = name.toLowerCase();

		const salt = nations[id]?.salt ?? (await invoke<string>('generate_salt'));
		const [password, nonce] = await invoke<[number[], number[]]>('encrypt', {
			data: nationPassword,
			password: masterPassword,
			salt: salt
		});

		nations[id] = {
			name: name,
			salt: salt,
			nonce: nonce,
			password: password
		};
		nations = nations;

		await localForage.setItem('nations', nations);
	}

	async function removeNation(nation: string) {
		delete nations[nation.toLowerCase()];
		nations = nations;

		await localForage.setItem('nations', nations);
	}

	async function getPassword(nation: string) {
		const id = nation.toLowerCase();

		if (!(id in nations)) throw 'Nation was not found.';

		const { salt, nonce, password } = nations[id];

		return await invoke('decrypt', {
			data: password,
			salt: salt,
			nonce: nonce,
			password: masterPassword
		});
	}

	const { form } = createForm({
		onSubmit: async (values) => {
			await addNation(values.name, values.password);
			isOpen = false;
		}
	});
</script>

<div class="p-8">
	<h1 class="font-extrabold text-5xl text-amber-600 dark:text-amber-400">Vinta</h1>
	<p>A tool to prep your puppets.</p>

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
				class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-md rounded-lg border"
			>
				<DialogTitle class="text-lg font-medium leading-6 text-gray-900">Add Nation</DialogTitle>

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

	{#if nations}
		<h1 class="font-bold text-3xl text-amber-600 dark:text-amber-400 mt-4 mb-2">My Nations</h1>

		<div>
			{#each Object.entries(nations) as [id, nation]}
				<div>
					<button on:click={() => removeNation(nation.name)}>[x]</button>
					<button on:click={async () => await open(`https://nationstates.net/${id}`)}
						><strong>{nation.name}</strong></button
					>
				</div>
			{/each}
		</div>
	{/if}
</div>
