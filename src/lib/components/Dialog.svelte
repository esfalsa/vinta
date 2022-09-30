<script lang="ts">
	import { Dialog, DialogOverlay, DialogTitle } from '@rgossiaux/svelte-headlessui';

	export let open: boolean;
	export let title: string;
</script>

<Dialog class="fixed inset-0 z-10 overflow-y-auto" {open} on:close>
	<div class="min-h-screen px-4 text-center">
		<DialogOverlay class="fixed inset-0 bg-stone-900/40" />

		<!-- This element is to trick the browser into centering the modal contents. -->
		<span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>
		<div
			class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white border rounded-lg shadow-md transition-all transform"
		>
			<DialogTitle class="mb-4 text-2xl font-bold text-stone-900 leading-6">{title}</DialogTitle>

			<slot />
		</div>
	</div>
</Dialog>
