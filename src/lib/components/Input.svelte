<script lang="ts">
	let className = '';
	export { className as class };

	export let type: string;
</script>

<input
	class={`border-1 border-stone-300 border rounded-md shadow ${className} ${
		type === 'checkbox' && 'w-5 h-5 text-orange-400'
	}`}
	{type}
	{...$$restProps}
	on:click
	on:change
	on:keydown
	on:keyup
	on:mouseenter
	on:mouseleave
/>
