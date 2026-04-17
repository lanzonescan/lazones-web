<script lang="ts">
	import AppShell from '$lib/components/layout/app-shell.svelte';
	import HouseIcon from 'phosphor-svelte/lib/House';
	import CameraIcon from 'phosphor-svelte/lib/Camera';
	import ClockCounterClockwiseIcon from 'phosphor-svelte/lib/ClockCounterClockwise';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	onMount(() => {
		if (!document.cookie.includes('tz=')) {
			document.cookie = `tz=${Intl.DateTimeFormat().resolvedOptions().timeZone};path=/;max-age=31536000`;
		}
	});

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: HouseIcon },
		{ href: '/scan', label: 'Scan', icon: CameraIcon },
		{ href: '/history', label: 'History', icon: ClockCounterClockwiseIcon }
	];
</script>

<AppShell
	{navItems}
	adminItems={[]}
	user={{ name: data.user?.name, role: data.user?.role, image: data.user?.image }}
	unreadCount={0}
	isAdmin={false}
>
	{@render children()}
</AppShell>
