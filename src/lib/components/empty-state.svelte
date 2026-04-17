<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let {
		icon: Icon,
		title,
		description,
		action
	}: {
		icon?: Component<any>;
		title: string;
		description?: string;
		action?: Snippet;
	} = $props();
</script>

<div class="flex flex-col justify-center items-center px-4 py-12 border border-dashed rounded-lg text-center">
	{#if Icon}
		<Icon class="mb-3 size-10 text-muted-foreground/40" />
	{/if}
	<p class="font-medium text-foreground">{title}</p>
	{#if description}
		<p class="mt-1 text-muted-foreground text-sm">{description}</p>
	{/if}
	{#if action}
		<div class="mt-5">{@render action()}</div>
	{/if}
</div>
