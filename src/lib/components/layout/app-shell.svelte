<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import BottomNav from './bottom-nav.svelte';
	import TopBar from './top-bar.svelte';
	import type { FlatNavItem, NavItem } from './nav-types';

	let {
		navItems,
		adminItems = [],
		user,
		unreadCount = 0,
		isAdmin = false,
		children
	}: {
		navItems: NavItem[];
		adminItems?: FlatNavItem[];
		user: { name?: string | null; role?: string | null; image?: string | null };
		unreadCount?: number;
		isAdmin?: boolean;
		children: Snippet;
	} = $props();

	const userInitial = $derived(user?.name?.charAt(0).toUpperCase() ?? '?');
</script>

<div class="flex flex-col min-h-screen" data-unread={unreadCount}>
	<TopBar {navItems} {adminItems} {userInitial} userImage={user?.image} {isAdmin} />

	<main class="flex-1 px-4 pt-5 pb-24 md:px-8 md:pt-8 md:pb-12">
		{#key page.url.pathname}
			<div class="mx-auto max-w-2xl fade-in">
				{@render children()}
			</div>
		{/key}
	</main>

	<BottomNav {navItems} />
</div>
