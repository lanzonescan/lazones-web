<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Label as LabelPrimitive } from 'bits-ui';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: LabelPrimitive.RootProps = $props();
</script>

<LabelPrimitive.Root
	bind:ref
	class={cn(
		'text-sm font-medium leading-none select-none',
		className
	)}
	{...restProps}
/>
