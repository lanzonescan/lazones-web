<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	let {
		header,
		children,
		class: className
	}: {
		header?: Snippet;
		children: Snippet;
		class?: string;
	} = $props();
</script>

<div class={cn('rounded-lg border-2 border-border bg-[var(--white)] shadow-offset', className)}>
	{#if header}
		<div class="border-b-2 border-border px-5 py-3">
			{@render header()}
		</div>
	{/if}
	<div class="px-5 py-4">
		{@render children()}
	</div>
</div>
