<script lang="ts">
	import * as localForage from 'localforage';
	import { createForm } from 'felte';
	import { reporter, ValidationMessage } from '@felte/reporter-svelte';

	type PreferenceFields = {
		jumpPoint: string;
		userAgent: string;
	};

	const { form, isSubmitting } = createForm<PreferenceFields>({
		onSubmit: async (values) => {
			let errors: Partial<PreferenceFields> = {};
			if (values.jumpPoint) {
				await localForage.setItem('jumpPoint', values.jumpPoint);
			} else {
				errors.jumpPoint = 'Please enter a jump point.';
			}

			if (values.userAgent) {
				await localForage.setItem('userAgent', values.userAgent);
			} else {
				errors.userAgent = 'Please enter an user agent.';
			}

			if (Object.keys(errors).length !== 0) throw errors;
		},
		onError: (errors: any) => errors,
		extend: reporter
	});
</script>

<div class="p-8">
	<h1 class="text-5xl font-extrabold text-amber-600 dark:text-amber-400">Preferences</h1>

	{#await localForage.getItem('userAgent') then userAgent}
		{userAgent}
	{/await}

	{#await Promise.all( [localForage.getItem('jumpPoint'), localForage.getItem('userAgent')] ) then [jumpPoint, userAgent]}
		<form use:form>
			<label for="jumpPoint">Jump Point</label>
			<input
				type="jumpPoint"
				name="jumpPoint"
				id="jumpPoint"
				placeholder="Jump Point"
				value={jumpPoint}
				required
			/>
			<ValidationMessage for="jumpPoint" let:messages>
				{messages?.[0] || ''}
			</ValidationMessage>

			<label for="userAgent">User Agent</label>
			<input
				type="userAgent"
				name="userAgent"
				id="userAgent"
				placeholder="User Agent"
				value={userAgent}
				required
			/>
			<ValidationMessage for="userAgent" let:messages>
				{messages?.[0] || ''}
			</ValidationMessage>

			{#if $isSubmitting}
				<button type="submit" disabled>Submitting…</button>
			{:else}
				<button type="submit">Submit</button>
			{/if}
		</form>
	{/await}
</div>
