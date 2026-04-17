<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import Eye from 'phosphor-svelte/lib/Eye';
	import EyeSlash from 'phosphor-svelte/lib/EyeSlash';
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		value = $bindable(''),
		class: className,
		...restProps
	}: HTMLInputAttributes & { ref?: HTMLInputElement | null } = $props();

	let visible = $state(false);
</script>

<div class="relative">
	<input
		bind:this={ref}
		bind:value
		type={visible ? 'text' : 'password'}
		class={cn(
			'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
			className
		)}
		{...restProps}
	/>
	<button
		type="button"
		onclick={() => (visible = !visible)}
		class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
		tabindex={-1}
	>
		{#if visible}
			<EyeSlash class="size-4" />
		{:else}
			<Eye class="size-4" />
		{/if}
	</button>
</div>
