<script lang="ts">
	import { nations, password } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import * as localForage from 'localforage';
	import { createForm } from 'felte';
	import Dialog from '$lib/components/Dialog.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';

	export let open: boolean;

	function close() {
		open = false;
	}

	const { form, isSubmitting } = createForm({
		onSubmit: async (values) => {
			await addNation(values.name, values.password);
			open = false;
		}
	});

	async function addNation(name: string, password: string) {
		$nations.push({ name, password });

		await updateEncryptedNations($nations);
		$nations = $nations;
	}

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
</script>

<Dialog bind:open on:close={close} title="Add Nation">
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
			<Button color="light" on:click={close}>Cancel</Button>
		</div>
	</form>
</Dialog>
