<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { tick } from 'svelte';
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

	let navEl = $state<HTMLElement | null>(null);
	let pillLeft = $state(0);
	let pillWidth = $state(0);
	let pillVisible = $state(false);
	let pillReady = $state(false);

	afterNavigate(() => {
		dropdownOpen = null;
		measurePill();
	});

	async function measurePill() {
		if (!navEl) return;
		await tick();
		const active = navEl.querySelector<HTMLElement>('[data-nav-active="true"]');
		if (!active) {
			pillVisible = false;
			return;
		}
		const navRect = navEl.getBoundingClientRect();
		const activeRect = active.getBoundingClientRect();
		pillLeft = activeRect.left - navRect.left;
		pillWidth = activeRect.width;
		pillVisible = true;
		if (!pillReady) requestAnimationFrame(() => (pillReady = true));
	}

	$effect(() => {
		void page.url.pathname;
		void navItems;
		void adminItems;
		void isAdmin;
		measurePill();
	});

	$effect(() => {
		if (!navEl) return;
		const ro = new ResizeObserver(() => measurePill());
		ro.observe(navEl);
		return () => ro.disconnect();
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
				src="/favicon-sm.png"
				alt=""
				class="shadow-offset-sm border border-border/60 rounded-[10px] size-9"
			/>
			<div class="leading-none">
				<span class="block font-serif text-[17px]">Lanzones</span>
				<p class="inline-block bg-[var(--primary-200)] mt-0.5 px-[5px] py-[2px] rounded-[3px] font-mono text-[8.5px] font-semibold tracking-[0.2em] uppercase text-[var(--primary-700)]">
					Scan
				</p>
			</div>
		</a>

		<nav
			bind:this={navEl}
			class="hidden md:flex relative justify-center items-center gap-0.5 bg-(--neutral-50) border border-border rounded-full p-[3px] justify-self-center"
		>
			<span
				aria-hidden="true"
				class="absolute top-[3px] bottom-[3px] left-0 rounded-full bg-(--white) shadow-[inset_0_0_0_1px_var(--border)] pointer-events-none {pillReady
					? 'transition-[transform,width,opacity] duration-[250ms] ease-out'
					: ''}"
				style:transform="translateX({pillLeft}px)"
				style:width="{pillWidth}px"
				style:opacity={pillVisible ? 1 : 0}
			></span>
			{#each navItems as item (item.label)}
				{#if 'children' in item}
					{@const active = isGroupActive(item)}
					<div class="relative">
						<button
							data-nav-active={active}
							class="relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-100 text-foreground {active ? '' : 'hover:bg-(--white)/60'}"
							onclick={() => (dropdownOpen = dropdownOpen === item.label ? null : item.label)}
						>
							<item.icon class="size-4 opacity-75" />
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
						data-nav-active={active}
						class="relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-100 text-foreground {active ? '' : 'hover:bg-(--white)/60'}"
					>
						<item.icon class="size-4 opacity-75" />
						{item.label}
					</a>
				{/if}
			{/each}
			{#if isAdmin && adminItems.length > 0}
				<span class="mx-1 bg-border w-px h-5 relative z-10"></span>
				{#each adminItems as item (item.href)}
					{@const active = isActive(item.href)}
					<a
						href={item.href}
						data-nav-active={active}
						class="relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-100 text-foreground {active ? '' : 'hover:bg-(--white)/60'}"
					>
						<item.icon class="size-4 opacity-75" />
						{item.label}
					</a>
				{/each}
			{/if}
		</nav>

		<div class="flex justify-end items-center gap-1.5">
			<div class="relative">
				<button
					class="flex justify-center items-center bg-[var(--primary-500)] hover:brightness-105 rounded-full size-[30px] transition-all duration-100 cursor-pointer"
					onclick={() => (menuOpen = !menuOpen)}
					aria-label="Profile menu"
				>
					{#if userImage}
						<img
							src={userImage}
							alt=""
							class="size-full rounded-full object-cover"
						/>
					{:else}
						<span class="font-mono font-semibold text-[11px] text-white">{userInitial}</span>
					{/if}
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
