<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/page-header.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import ScanCard from '$lib/components/scan-card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import CameraIcon from 'phosphor-svelte/lib/Camera';

	let { data } = $props();
</script>

<svelte:head><title>History | Lanzones Scan</title></svelte:head>

<div class="mx-auto max-w-6xl p-6 space-y-6 fade-in">
	<PageHeader title="History" description="Your past lanzones scans." />

	{#if data.scans.length === 0}
		<EmptyState
			icon={CameraIcon}
			title="Nothing here yet"
			description="Start by uploading your first image."
		>
			{#snippet action()}
				<Button size="sm" onclick={() => goto('/scan')}>
					<CameraIcon class="size-4" weight="bold" />
					Go to scan
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each data.scans as scan (scan.id)}
				<ScanCard {scan} />
			{/each}
		</div>

		{#if data.scans.length === data.pageSize || data.page > 1}
			<div class="flex justify-between pt-4">
				{#if data.page > 1}
					<a href="?page={data.page - 1}" class="text-primary hover:underline">← Previous</a>
				{:else}
					<span></span>
				{/if}
				{#if data.scans.length === data.pageSize}
					<a href="?page={data.page + 1}" class="text-primary hover:underline">Next →</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>
