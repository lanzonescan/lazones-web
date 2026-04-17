<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import Card from '$lib/components/card.svelte';
	import CameraIcon from 'phosphor-svelte/lib/Camera';

	let { data } = $props();
</script>

<svelte:head><title>Dashboard | Lanzones Scan</title></svelte:head>

<div class="mx-auto max-w-5xl p-6 space-y-6 fade-in">
	<PageHeader
		title="Welcome, {data.user?.name}"
		description="Your lanzones scans at a glance."
	/>

	<div class="grid gap-4 sm:grid-cols-3">
		<Card>
			<div class="text-sm text-muted-foreground">Total scans</div>
			<div class="text-3xl font-serif mt-2">{data.total}</div>
		</Card>
	</div>

	<section>
		<h3 class="font-serif text-lg mb-3">Recent scans</h3>
		{#if data.recent.length === 0}
			<EmptyState
				icon={CameraIcon}
				title="No scans yet"
				description="Upload your first image to get started."
			/>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.recent as scan (scan.id)}
					<a href="/history/{scan.id}" class="block">
						<Card>
							<img
								src={scan.cloudinaryUrl}
								alt={scan.filename}
								class="w-full aspect-video object-cover rounded mb-3"
							/>
							<div class="text-sm font-semibold truncate">{scan.filename}</div>
							<div class="text-xs text-muted-foreground">
								{scan.detections.length} detections
							</div>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	</section>
</div>
