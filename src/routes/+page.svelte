<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import * as localForage from 'localforage';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';

	onMount(async () => {
		window.location.assign(!!(await localForage.getItem('password')) ? '/login' : '/welcome');
	});
</script>

<LoadingScreen />
