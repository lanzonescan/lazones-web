<script lang="ts">
	import '@fontsource-variable/geist';
	import '../app.css';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { initTheme } from '$lib/utils/theme.svelte';

	let { children } = $props();

	let isMobile = $state(false);

	onMount(() => {
		initTheme();
		const mql = window.matchMedia('(max-width: 767px)');
		isMobile = mql.matches;
		const listener = (e: MediaQueryListEvent) => (isMobile = e.matches);
		mql.addEventListener('change', listener);
		return () => mql.removeEventListener('change', listener);
	});
</script>

{@render children()}

<Toaster
	position={isMobile ? 'top-center' : 'bottom-right'}
	richColors
	toastOptions={{ style: 'font-family: "Recursive", ui-sans-serif, system-ui, sans-serif;' }}
/>
