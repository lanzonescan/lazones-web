<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Avatar as AvatarPrimitive } from 'bits-ui';

	let {
		src,
		alt = '',
		fallback = '?',
		size = 'md',
		class: className,
		...restProps
	}: {
		src?: string | null;
		alt?: string;
		fallback?: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	} = $props();

	const sizes = {
		sm: 'size-8 text-xs',
		md: 'size-9 text-sm',
		lg: 'size-20 text-2xl'
	};
</script>

<AvatarPrimitive.Root
	class={cn(
		'relative flex shrink-0 overflow-hidden rounded-full',
		sizes[size],
		className
	)}
	{...restProps}
>
	{#if src}
		<AvatarPrimitive.Image {src} {alt} class="aspect-square h-full w-full object-cover" />
	{/if}
	<AvatarPrimitive.Fallback
		class="flex h-full w-full items-center justify-center rounded-full bg-primary font-medium text-primary-foreground"
	>
		{fallback}
	</AvatarPrimitive.Fallback>
</AvatarPrimitive.Root>
