<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/page-header.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import ScanCard from '$lib/components/scan-card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import CameraIcon from 'phosphor-svelte/lib/Camera';

	let { data } = $props();

	function pageItems(current: number, total: number): (number | 'ellipsis')[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
		const pages = new Set([1, total, current, current - 1, current + 1]);
		const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
		const out: (number | 'ellipsis')[] = [];
		for (let i = 0; i < sorted.length; i++) {
			if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('ellipsis');
			out.push(sorted[i]);
		}
		return out;
	}
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

		{#if data.totalPages > 1}
			<nav class="flex items-center justify-between gap-2 pt-4 sm:justify-center" aria-label="Pagination">
				{#if data.page > 1}
					<a
						href="?page={data.page - 1}"
						class="inline-flex h-11 items-center gap-1 rounded-md border border-border bg-card px-4 text-sm hover:bg-accent sm:h-9 sm:px-3"
						aria-label="Previous page"
					>
						<span aria-hidden="true">←</span>
						<span class="sm:hidden">Prev</span>
					</a>
				{:else}
					<span
						class="inline-flex h-11 items-center gap-1 rounded-md border border-border bg-card px-4 text-sm opacity-40 sm:h-9 sm:px-3"
						aria-disabled="true"
					>
						<span aria-hidden="true">←</span>
						<span class="sm:hidden">Prev</span>
					</span>
				{/if}

				<span class="text-sm text-muted-foreground sm:hidden">
					Page {data.page} of {data.totalPages}
				</span>

				<div class="hidden items-center gap-1 sm:flex">
					{#each pageItems(data.page, data.totalPages) as item, i (i)}
						{#if item === 'ellipsis'}
							<span class="inline-flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">…</span>
						{:else if item === data.page}
							<span
								class="inline-flex h-9 min-w-9 items-center justify-center rounded-md border-2 border-[var(--primary-500)] bg-[var(--primary-200)] px-2 text-sm font-bold"
								aria-current="page"
							>
								{item}
							</span>
						{:else}
							<a
								href="?page={item}"
								class="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border bg-card px-2 text-sm hover:bg-accent"
							>
								{item}
							</a>
						{/if}
					{/each}
				</div>

				{#if data.page < data.totalPages}
					<a
						href="?page={data.page + 1}"
						class="inline-flex h-11 items-center gap-1 rounded-md border border-border bg-card px-4 text-sm hover:bg-accent sm:h-9 sm:px-3"
						aria-label="Next page"
					>
						<span class="sm:hidden">Next</span>
						<span aria-hidden="true">→</span>
					</a>
				{:else}
					<span
						class="inline-flex h-11 items-center gap-1 rounded-md border border-border bg-card px-4 text-sm opacity-40 sm:h-9 sm:px-3"
						aria-disabled="true"
					>
						<span class="sm:hidden">Next</span>
						<span aria-hidden="true">→</span>
					</span>
				{/if}
			</nav>
		{/if}
	{/if}
</div>
