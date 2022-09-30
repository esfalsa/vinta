<script lang="ts">
	import { password, selected } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import { onMount } from 'svelte';
	import * as localForage from 'localforage';
	import { Prepper } from '$lib/prepper';

	let selectedNations: Nation[];
	let prepper: Prepper;
	let disabled = false;

	onMount(async () => {
		const encryptedNations = (await localForage.getItem('nations')) ?? [];
		const salt = await localForage.getItem('salt');
		const nonce = await localForage.getItem('nonce');

		const nations: Nation[] =
			JSON.parse(
				await invoke('decrypt', {
					data: encryptedNations,
					password: $password,
					salt: salt,
					nonce: nonce
				})
			) || [];

		const userAgent = await localForage.getItem<string | null>('userAgent');
		const jumpPoint = await localForage.getItem<string | null>('jumpPoint');

		selectedNations = nations.filter((_nation, index) => $selected.includes(index));

		if (userAgent && jumpPoint) {
			prepper = await Prepper.initialize(userAgent, nations, jumpPoint);
		}
	});

	async function prep() {
		disabled = true;
		await prepper.prep();
		disabled = false;
	}
</script>

<div class="p-8">
	<h1 class="mt-4 mb-2 text-3xl font-bold text-amber-600 dark:text-amber-400">Prep Nations</h1>

	{#if selectedNations == null}
		Loading…
	{:else if selectedNations.length > 0}
		{selectedNations.length > 1
			? `${selectedNations.length} nations`
			: `${selectedNations.length} nation`} loaded.

		<button on:click={prep} {disabled} class="disabled:text-gray-400">Prep</button>
	{:else}
		No nations found. <a href="/nations">Edit nations</a>
	{/if}
</div>
