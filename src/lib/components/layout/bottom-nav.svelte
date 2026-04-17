<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { NavItem } from './nav-types';

	let {
		navItems
	}: {
		navItems: NavItem[];
	} = $props();

	let popoverOpen = $state<string | null>(null);

	afterNavigate(() => {
		popoverOpen = null;
	});

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}

	function isGroupActive(item: NavItem): boolean {
		if ('children' in item) {
			return item.children.some((child) => isActive(child.href));
		}
		return isActive(item.href);
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-border bg-(--white) md:hidden">
	<div class="flex justify-around items-center mx-auto max-w-lg h-16">
		{#each navItems as item (item.label)}
			{#if 'children' in item}
				{@const active = isGroupActive(item)}
				<div class="relative flex flex-col justify-center items-center w-full h-full">
					<button
						class="flex flex-col items-center text-nowrap justify-center gap-1 w-full h-full transition-colors {active
							? 'text-primary'
							: 'text-(--neutral-500)'}"
						onclick={() => (popoverOpen = popoverOpen === item.label ? null : item.label)}
					>
						<item.icon class="size-6" />
						<span
							class="flex items-center gap-0.5 font-bold text-[10px] text-nowrap leading-tight"
						>
							{item.label}
						</span>
					</button>
					{#if popoverOpen === item.label}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="z-40 fixed inset-0"
							onclick={() => (popoverOpen = null)}
							onkeydown={() => {}}
						></div>
						<div
							class="absolute bottom-full mb-2 right-2 z-50 min-w-45 rounded-lg border-2 border-border bg-(--white) p-1.5 shadow-offset"
							role="menu"
						>
							{#each item.children as child (child.href)}
								{@const childActive = isActive(child.href)}
								<a
									href={child.href}
									class="flex items-center text-nowrap gap-2.5 rounded-md px-3 py-2.5 text-sm transition-all duration-100 {childActive
										? 'text-foreground font-semibold bg-(--neutral-200)'
										: 'hover:bg-secondary'}"
									role="menuitem"
								>
									<child.icon class="size-4 text-(--neutral-500)" />
									{child.label}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				{@const active = isActive(item.href)}
				<a
					href={item.href}
					class="flex flex-col items-center justify-center gap-1 w-full h-full transition-colors {active
						? 'text-primary'
						: 'text-(--neutral-500)'}"
				>
					<item.icon class="size-6" />
					<span class="font-bold text-[10px] leading-tight">{item.label}</span>
				</a>
			{/if}
		{/each}
	</div>
</nav>
