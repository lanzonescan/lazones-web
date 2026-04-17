import type { Component } from 'svelte';

export type FlatNavItem = { href: string; label: string; icon: Component<any> };
export type NavItem =
	| FlatNavItem
	| { label: string; icon: Component<any>; children: FlatNavItem[] };
