<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Separator as SeparatorPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		orientation = 'horizontal',
		class: className,
		...restProps
	}: SeparatorPrimitive.RootProps = $props();
</script>

<SeparatorPrimitive.Root
	bind:ref
	{orientation}
	class={cn(
		'shrink-0 bg-border',
		orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
		className
	)}
	{...restProps}
/>
