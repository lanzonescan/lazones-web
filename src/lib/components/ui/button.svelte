<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		ref = $bindable(null),
		variant = 'primary',
		size = 'md',
		class: className,
		children,
		...restProps
	}: HTMLButtonAttributes & {
		ref?: HTMLElement | null;
		variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
		size?: 'sm' | 'md' | 'lg' | 'icon';
		children?: Snippet;
	} = $props();

	const variants = {
		primary: 'bg-[var(--primary-200)] border-2 border-[var(--primary-500)] text-foreground shadow-[3px_5px_0_0_var(--primary-500)] hover:brightness-105 active:translate-y-0.5 active:shadow-[1px_2px_0_0_var(--primary-500)]',
		secondary: 'bg-[var(--white)] border-2 border-border text-foreground shadow-offset-sm hover:bg-secondary active:translate-y-0.5 active:scale-[0.98] active:shadow-none',
		ghost: 'text-muted-foreground hover:text-foreground hover:bg-accent',
		destructive: 'bg-[var(--white)] border-2 border-red-500/30 text-destructive shadow-[1px_2px_0_0_rgba(245,61,81,0.15)] hover:border-red-500 hover:shadow-[1px_2px_0_0_rgba(245,61,81,0.3)] active:translate-y-0.5 active:scale-[0.98] active:shadow-none'
	};

	const sizes = {
		sm: 'h-8 px-3 text-sm',
		md: 'h-10 px-5 text-base',
		lg: 'h-11 px-6 text-base',
		icon: 'h-9 w-9'
	};
</script>

<button
	bind:this={ref}
	class={cn(
		'font-serif inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-100 ease-in-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
		variants[variant],
		sizes[size],
		className
	)}
	{...restProps}
>
	{@render children?.()}
</button>
