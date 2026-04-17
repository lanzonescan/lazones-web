<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import Avatar from '$lib/components/ui/avatar.svelte';
	import { getTheme, setTheme } from '$lib/utils/theme.svelte';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';
	import Check from 'phosphor-svelte/lib/Check';
	import Monitor from 'phosphor-svelte/lib/Monitor';
	import Moon from 'phosphor-svelte/lib/Moon';
	import Shield from 'phosphor-svelte/lib/Shield';
	import SignOut from 'phosphor-svelte/lib/SignOut';
	import Sun from 'phosphor-svelte/lib/Sun';
	import User from 'phosphor-svelte/lib/User';
	import type { Component } from 'svelte';
	import type { NavItem } from './nav-types';

	let {
		navItems,
		adminItems = [],
		userInitial,
		userImage,
		isAdmin = false
	}: {
		navItems: NavItem[];
		adminItems?: Array<{ href: string; label: string; icon: Component<any> }>;
		userInitial: string;
		userImage?: string | null;
		isAdmin?: boolean;
	} = $props();

	let menuOpen = $state(false);
	let dropdownOpen = $state<string | null>(null);

	afterNavigate(() => {
		dropdownOpen = null;
	});

	const themeOptions = [
		{ value: 'light' as const, label: 'Light', icon: Sun },
		{ value: 'dark' as const, label: 'Dark', icon: Moon },
		{ value: 'system' as const, label: 'System', icon: Monitor }
	];

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

<header class="sticky top-0 z-40 border-b-2 border-border bg-(--white)">
	<div class="items-center grid grid-cols-[auto_1fr_auto] mx-auto px-4 md:px-8 max-w-5xl h-14">
		<a href="/" class="flex items-center gap-2.5 text-lg shrink-0">
			<img
				src="/favicon.png"
				alt=""
				class="size-9 rounded-[10px] shadow-offset-sm border border-border/60"
			/>
			<div class="leading-none">
				<h1 class="font-serif text-[17px]">Lanzones</h1>
				<p class="bg-primary/20 px-2 mt-0.5 inline-block rounded-full text-[10px] uppercase tracking-wider">
					Scan
				</p>
			</div>
		</a>

		<nav class="hidden md:flex justify-center items-center gap-0.5">
			{#each navItems as item (item.label)}
				{#if 'children' in item}
					{@const active = isGroupActive(item)}
					<div class="relative">
						<button
							class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-100 {active
								? 'text-foreground font-semibold bg-(--neutral-200)'
								: 'text-(--neutral-500) hover:text-foreground hover:bg-(--neutral-100)'}"
							onclick={() => (dropdownOpen = dropdownOpen === item.label ? null : item.label)}
						>
							<item.icon class="size-4" />
							{item.label}
							<CaretDown
								class="size-3 transition-transform {dropdownOpen === item.label ? 'rotate-180' : ''}"
							/>
						</button>
						{#if dropdownOpen === item.label}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="z-40 fixed inset-0"
								onclick={() => (dropdownOpen = null)}
								onkeydown={() => {}}
							></div>
							<div
								class="absolute left-0 top-10 z-50 min-w-45 rounded-lg border-2 border-border bg-(--white) p-1.5 shadow-offset"
								role="menu"
							>
								{#each item.children as child (child.href)}
									{@const childActive = isActive(child.href)}
									<a
										href={child.href}
										class="flex items-center gap-2.5 rounded-md text-nowrap px-3 py-2 text-sm transition-all duration-100 {childActive
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
						class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-100 {active
							? 'text-foreground font-semibold bg-(--neutral-200)'
							: 'text-(--neutral-500) hover:text-foreground hover:bg-(--neutral-100)'}"
					>
						<item.icon class="size-4" />
						{item.label}
					</a>
				{/if}
			{/each}
			{#if isAdmin && adminItems.length > 0}
				<span class="mx-1 bg-border w-px h-5"></span>
				{#each adminItems as item (item.href)}
					{@const active = isActive(item.href)}
					<a
						href={item.href}
						class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-100 {active
							? 'text-foreground font-semibold bg-(--neutral-200)'
							: 'text-(--neutral-500) hover:text-foreground hover:bg-(--neutral-100)'}"
					>
						<item.icon class="size-4" />
						{item.label}
					</a>
				{/each}
			{/if}
		</nav>

		<div class="flex justify-end items-center gap-1.5">
			<div class="relative">
				<button
					class="flex justify-center items-center shadow-offset-sm active:shadow-none border-2 border-border hover:border-primary rounded-full size-9 transition-all active:translate-y-0.5 duration-100"
					onclick={() => (menuOpen = !menuOpen)}
				>
					<Avatar src={userImage} fallback={userInitial} />
				</button>
				{#if menuOpen}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="z-40 fixed inset-0"
						onclick={() => (menuOpen = false)}
						onkeydown={() => {}}
					></div>
					<div
						class="absolute right-0 top-12 z-50 min-w-45 rounded-lg border-2 border-border bg-(--white) p-1.5 shadow-offset"
						role="menu"
					>
						<a
							href="/profile"
							class="flex items-center gap-2.5 hover:bg-secondary px-3 py-2 rounded-md text-sm transition-all duration-100"
							onclick={() => (menuOpen = false)}
						>
							<User class="size-4 text-(--neutral-500)" />
							Profile
						</a>
						{#if isAdmin}
							<a
								href="/admin"
								class="flex items-center gap-2.5 hover:bg-secondary px-3 py-2 rounded-md text-sm transition-all duration-100"
								onclick={() => (menuOpen = false)}
							>
								<Shield class="size-4 text-(--neutral-500)" />
								Admin
							</a>
						{/if}
						<div class="my-1 bg-border h-0.5"></div>
						<p class="px-3 py-1.5 font-semibold text-muted-foreground text-xs">Theme</p>
						{#each themeOptions as opt (opt.value)}
							<button
								class="flex items-center gap-2.5 hover:bg-secondary px-3 py-2 rounded-md w-full text-sm transition-all duration-100"
								onclick={() => setTheme(opt.value)}
							>
								<opt.icon class="size-4 text-(--neutral-500)" />
								{opt.label}
								{#if getTheme() === opt.value}
									<Check class="ml-auto size-4 text-primary" />
								{/if}
							</button>
						{/each}
						<div class="my-1 bg-border h-0.5"></div>
						<a
							href="/logout"
							class="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive hover:bg-(--red-50) transition-all duration-100"
						>
							<SignOut class="size-4" />
							Sign out
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
