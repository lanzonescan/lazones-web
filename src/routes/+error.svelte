<script lang="ts">
	import { page } from '$app/state';
	import PageError from '$lib/components/page-error.svelte';
</script>

<PageError status={page.status} message={page.error?.message} appTitle="Lanzones Scan" />
