<script lang="ts">
	import { selected, nations } from '$lib/stores';
	import * as localForage from 'localforage';
	import { Prepper } from '$lib/prepper';
	import Button from '$lib/components/Button.svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	export let open: boolean;
	let selectedNations: Nation[];
	let prepper: Prepper;
	let disabled = false;
	let userAgent: string | null;
	let jumpPoint: string | null;

	async function loadPrepper() {
		await localForage.removeItem('jumpPoint');

		userAgent = await localForage.getItem<string | null>('userAgent');
		jumpPoint = await localForage.getItem<string | null>('jumpPoint');

		selectedNations = $nations.filter((_nation, index) => $selected.includes(index));

		if (userAgent && jumpPoint) {
			prepper = await Prepper.initialize(userAgent, $nations, jumpPoint);
		}
	}

	$: open && loadPrepper();

	async function prep() {
		disabled = true;
		await prepper.prep();
		disabled = false;
	}

	function close() {
		open = false;
	}
</script>

<Dialog bind:open on:close={close} title="Prep Nations">
	{#if !userAgent || !jumpPoint}
		<div class="space-y-2">
			<div>
				You seem to be missing a user agent and/or jump point. <a
					href="/preferences"
					class="text-orange-400">Set them in your preferences</a
				>
				to prep your nations.
			</div>
			<div class="space-x-2">
				<Button href="/preferences">Open Preferences</Button>
				<Button color="light" on:click={close}>Cancel</Button>
			</div>
		</div>
	{:else if selectedNations == null}
		Loading…
	{:else if selectedNations.length > 0}
		{selectedNations.length > 1
			? `${selectedNations.length} nations`
			: `${selectedNations.length} nation`} loaded.

		<Button on:click={prep} {disabled} class="disabled:text-gray-400">Prep</Button>
		<Button color="light" on:click={close}>Cancel</Button>
	{:else}
		No nations selected.

		<Button on:click={close}>Edit Nations</Button>
	{/if}
</Dialog>
