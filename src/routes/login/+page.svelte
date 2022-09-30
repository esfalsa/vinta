<script lang="ts">
	import { password } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import * as localForage from 'localforage';
	import { createForm } from 'felte';
	import { reporter, ValidationMessage } from '@felte/reporter-svelte';
	import Button from '$lib/components/Button.svelte';

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

<div class="flex flex-col justify-center h-screen max-w-2xl p-8 mx-auto text-stone-900">
	<div class="mb-12 text-center space-y-4">
		<h1 class="text-6xl font-semibold tracking-tight">Welcome back!</h1>
		<h2 class="text-3xl text-stone-600">Enter your password to continue.</h2>
	</div>

	<form use:form class="flex flex-col w-full max-w-sm mx-auto">
		<input
			type="password"
			placeholder="Password"
			name="password"
			id="password"
			class="w-full mt-1 border shadow border-1 border-stone-300 rounded-md"
			required
		/>
		<div class="text-red-400">
			<ValidationMessage for="password" let:messages>
				{messages?.[0] || ''}
			</ValidationMessage>
		</div>

		<Button type="submit" disabled={$isSubmitting} class="mt-4">
			{$isSubmitting ? 'Loading…' : 'Log In'}
		</Button>
	</form>
</div>
