<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';

	let {
		label,
		error,
		id,
		children
	}: {
		label: string;
		error?: string | string[] | undefined;
		id?: string;
		children: import('svelte').Snippet;
	} = $props();

	const errorMessage = $derived(
		Array.isArray(error) ? error[0] : error
	);
</script>

<div class="space-y-2">
	<Label for={id}>{label}</Label>
	{@render children()}
	{#if errorMessage}
		<p class="text-sm text-destructive">{errorMessage}</p>
	{/if}
</div>
