<script lang="ts">
	let className = '';
	export { className as class };

	export let color = 'default';
	export let href: string | undefined = undefined;

	let classes: Record<string, string> = {
		default:
			'text-orange-50 disabled:bg-orange-200 px-3 py-2 font-medium bg-orange-400 rounded-md shadow border border-1 border-orange-400 disabled:border-orange-200',
		light:
			'text-stone-800 disabled:text-stone-400 px-3 py-2 font-medium bg-white rounded-md shadow border border-1 border-stone-200'
	};
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	class={`${classes[color]} ${className}`}
	{href}
	{...$$restProps}
	on:click
	on:change
	on:keydown
	on:keyup
	on:mouseenter
	on:mouseleave
>
	<slot />
</svelte:element>
