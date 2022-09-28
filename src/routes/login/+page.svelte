<script lang="ts">
	import { password } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import * as localForage from 'localforage';
	import { createForm } from 'felte';
	import { reporter, ValidationMessage } from '@felte/reporter-svelte';

	if ($password) {
		window.location.assign('/nations');
	}

	type LoginFields = {
		password: string;
	};

	const { form, isSubmitting } = createForm<LoginFields>({
		onSubmit: async (values) => {
			let errors: Partial<LoginFields> = {};
			const hash = await localForage.getItem('password');
			if (await invoke('verify_password', { password: values.password, hash: hash })) {
				$password = values.password;
				window.location.assign('/nations');
			} else {
				errors.password = 'Incorrect password.';
			}
			if (Object.keys(errors).length !== 0) throw errors;
		},
		onError: (errors: any) => errors,
		extend: reporter
	});
</script>

<div class="text-stone-900 flex flex-col justify-center h-screen max-w-2xl p-8 mx-auto">
	<div class="mb-12 space-y-4 text-center">
		<h1 class="text-6xl font-semibold tracking-tight">Welcome back!</h1>
		<h2 class="text-stone-600 text-3xl">Enter your password to continue.</h2>
	</div>

	<form use:form class="flex flex-col w-full max-w-sm mx-auto">
		<input
			type="password"
			placeholder="Password"
			name="password"
			id="password"
			class="border-1 border-stone-300 w-full mt-1 border rounded-md shadow"
			required
		/>
		<div class="text-red-400">
			<ValidationMessage for="password" let:messages>
				{messages?.[0] || ''}
			</ValidationMessage>
		</div>

		<button
			type="submit"
			class="text-orange-50 mt-4 disabled:bg-orange-200 px-3 py-2 font-medium bg-orange-400 rounded-md shadow"
			disabled={$isSubmitting}
		>
			{$isSubmitting ? 'Loading…' : 'Continue'}
		</button>
	</form>
</div>
