<script lang="ts">
	import { password } from '$lib/stores';
	import { invoke } from '@tauri-apps/api/tauri';
	import { onMount } from 'svelte';
	import * as localForage from 'localforage';
	import { createForm } from 'felte';
	import { reporter, ValidationMessage } from '@felte/reporter-svelte';

	let hasPassword: boolean;

	onMount(async () => {
		hasPassword = !!(await localForage.getItem('password'));
	});

	type LoginFields = { password: string };

	const { form: loginForm } = createForm<LoginFields>({
		onSubmit: async (values) => {
			let errors: Partial<LoginFields> = {};
			const hash = await localForage.getItem('password');
			if (await invoke('verify_password', { password: values.password, hash: hash })) {
				password.set(values.password);
				window.location.assign('/nations');
			} else {
				errors.password = 'Incorrect password.';
			}
			throw errors;
		},
		onError: (errors: any) => errors,
		extend: reporter
	});

	type CreationFields = { password: string; verifyPassword: string };

	const { form: creationForm } = createForm<CreationFields>({
		onSubmit: async (values) => {
			let errors: Partial<CreationFields> = {};
			if (values.password === values.verifyPassword) {
				password.set(values.password);
				await localForage.setItem(
					'password',
					await invoke('hash_password', { password: values.password })
				);
				window.location.assign('/nations');
			} else {
				errors.verifyPassword = 'Passwords do not match.';
			}
			throw errors;
		},
		onError: (error: any) => error,
		extend: reporter
	});
</script>

<div class="p-8">
	<h1 class="font-extrabold text-5xl text-amber-600 dark:text-amber-400">Vinta</h1>
	<p>A tool to prep your puppets.</p>

	{#if hasPassword == null}
		Loading...
	{:else if hasPassword}
		<p><strong>Log in</strong></p>

		<form use:loginForm>
			<label for="password">Password</label>
			<input type="password" name="password" id="password" placeholder="Password" required />
			<ValidationMessage for="password" let:messages>
				{messages?.[0] || ''}
			</ValidationMessage>

			<button type="submit">Submit</button>
		</form>
	{:else}
		<p><strong>Create password</strong></p>

		<form use:creationForm>
			<label for="password">Password</label>
			<input type="password" name="password" id="password" placeholder="Password" required />

			<label for="verifyPassword">Verify Password</label>
			<input
				type="password"
				name="verifyPassword"
				id="verifyPassword"
				placeholder="Verify password"
				required
			/>
			<ValidationMessage for="verifyPassword" let:messages>
				{messages?.[0] || ''}
			</ValidationMessage>

			<button type="submit">Submit</button>
		</form>
	{/if}
</div>
