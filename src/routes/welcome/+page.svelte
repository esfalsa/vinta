<script lang="ts">
	import { password } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import * as localForage from 'localforage';
	import { createForm } from 'felte';

	type SetupFields = {
		userAgent: string;
		password: string;
	};

	const { form, isSubmitting } = createForm({
		onSubmit: async (values: SetupFields) => {
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

<div class="text-stone-900 flex flex-col justify-center h-screen max-w-2xl p-8 mx-auto">
	<div class="mb-12 space-y-4 text-center">
		<h1 class="text-6xl font-semibold tracking-tight">
			Welcome to <span
				class="bg-clip-text bg-gradient-to-br from-orange-500 to-yellow-500 font-black text-transparent"
				>Vinta</span
			>!
		</h1>
		<h2 class="text-stone-600 text-3xl">Let’s get you set up.</h2>
	</div>

	<form use:form class="space-y-6">
		<div>
			<h3 class="text-2xl font-bold">Set your user agent</h3>
			<p class="text-stone-500">
				This is how we’ll identify you to NationStates, so it should be something identifiable to
				you like your nation name or an email address.
			</p>
			<input
				type="text"
				placeholder="Testlandia"
				name="userAgent"
				id="userAgent"
				class="border-1 border-stone-300 w-full mt-2 border rounded-md shadow"
				required
			/>
		</div>

		<div>
			<h3 class="text-2xl font-bold">Create your password</h3>
			<p class="text-stone-500">
				Your password never leaves your device. This also means you won’t be able to recover your
				data if you forget your password, so be careful!
			</p>
			<input
				type="password"
				placeholder="hunter2"
				name="password"
				id="password"
				class="border-1 border-stone-300 w-full mt-2 border rounded-md shadow"
				required
			/>
		</div>

		<button
			type="submit"
			class="text-orange-50 disabled:bg-orange-200 px-3 py-2 font-medium bg-orange-400 rounded-md shadow"
			disabled={$isSubmitting}
		>
			{$isSubmitting ? 'Loading…' : 'Continue'}
		</button>
	</form>
</div>
