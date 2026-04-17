<script lang="ts">
	import CircleNotch from 'phosphor-svelte/lib/CircleNotch';
	import Button from '$lib/components/ui/button.svelte';
	import type { Snippet } from 'svelte';

	let {
		loading = false,
		variant = 'primary',
		children,
		class: className,
		...restProps
	}: {
		loading?: boolean;
		variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
		children: Snippet;
		class?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
	} = $props();
</script>

<Button
	{variant}
	disabled={loading || restProps.disabled}
	class={className}
	{...restProps}
>
	{#if loading}
		<CircleNotch class="size-4 animate-spin" />
	{/if}
	{@render children()}
</Button>
