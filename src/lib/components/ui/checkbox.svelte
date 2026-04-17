<script lang="ts">
	import { Checkbox as CheckboxPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import Check from 'phosphor-svelte/lib/Check';
	import Minus from 'phosphor-svelte/lib/Minus';
	import { cn } from '$lib/utils/cn';

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props();
</script>

<CheckboxPrimitive.Root
	bind:ref
	bind:checked
	bind:indeterminate
	class={cn(
		'peer border-border hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		{#if indeterminate}
			<Minus class="size-3" weight="bold" />
		{:else if checked}
			<Check class="size-3" weight="bold" />
		{/if}
	{/snippet}
</CheckboxPrimitive.Root>
