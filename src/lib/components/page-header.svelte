<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		action
	}: {
		title: string;
		description?: string;
		action?: Snippet;
	} = $props();
</script>

<div class="flex items-start justify-between gap-4">
	<div>
		<h1 class="text-2xl">{title}</h1>
		{#if description}
			<p class="mt-1 text-sm text-light">{description}</p>
		{/if}
	</div>
	{#if action}
		{@render action()}
	{/if}
</div>
