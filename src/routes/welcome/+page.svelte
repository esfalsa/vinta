<script lang="ts">
	import { password } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import * as localForage from 'localforage';
	import { createForm } from 'felte';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';

	type SetupFields = {
		userAgent: string;
		password: string;
	};

	const { form, isSubmitting } = createForm<SetupFields>({
		onSubmit: async (values) => {
			await localForage.setItem('userAgent', values.userAgent);
			password.set(values.password);
			await localForage.setItem(
				'password',
				await invoke('hash_password', { password: values.password })
			);

			const salt = await invoke('generate_salt');
			localForage.setItem('salt', salt);

			const [encrypted, nonce] = await invoke<[number[], number[]]>('encrypt', {
				data: JSON.stringify([]),
				password: values.password,
				salt: salt
			});

			await localForage.setItem('nations', encrypted);
			await localForage.setItem('nonce', nonce);

			window.location.assign('/nations');
		}
	});
</script>

<div class="flex flex-col justify-center h-screen max-w-2xl p-8 mx-auto text-stone-900">
	<div class="mb-12 text-center space-y-4">
		<h1 class="text-6xl font-semibold tracking-tight">
			Welcome to <span
				class="font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-yellow-500"
				>Vinta</span
			>!
		</h1>
		<h2 class="text-3xl text-stone-600">Let’s get you set up.</h2>
	</div>

	<form use:form class="space-y-6">
		<div>
			<h3 class="text-2xl font-bold">Set your user agent</h3>
			<p class="text-stone-500">
				This is how we’ll identify you to NationStates, so it should be something identifiable to
				you like your nation name or an email address.
			</p>
			<Input
				type="text"
				placeholder="Testlandia"
				name="userAgent"
				id="userAgent"
				class="mt-2 w-full"
				required
			/>
		</div>

		<div>
			<h3 class="text-2xl font-bold">Create your password</h3>
			<p class="text-stone-500">
				Your password never leaves your device. This also means you won’t be able to recover your
				data if you forget your password, so be careful!
			</p>
			<Input
				type="password"
				placeholder="hunter2"
				name="password"
				id="password"
				class="mt-2 w-full"
				required
			/>
		</div>

		<Button type="submit" disabled={$isSubmitting}>
			{$isSubmitting ? 'Loading…' : 'Continue'}
		</Button>
	</form>
</div>
