<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingIcon from './LoadingIcon.svelte';

	onMount(() => {
		visible = true;
	});
</script>

<div class="flex items-center justify-center w-full h-screen">
	<LoadingIcon />
</div>
