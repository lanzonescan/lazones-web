<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		...restProps
	}: HTMLInputAttributes & { ref?: HTMLInputElement | null } = $props();
</script>

<input
	bind:this={ref}
	bind:value
	class={cn(
		'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...restProps}
/>
