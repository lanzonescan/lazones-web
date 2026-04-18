<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import Card from '$lib/components/card.svelte';
	import ScanCard from '$lib/components/scan-card.svelte';
	import DashboardActivityChart from '$lib/components/dashboard-activity-chart.svelte';
	import DashboardClassChart from '$lib/components/dashboard-class-chart.svelte';
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

	{#if data.total > 0}
		<section>
			<div class="grid gap-4 md:grid-cols-2">
				<Card>
					<h3 class="font-serif text-base">Activity</h3>
					<p class="text-xs text-muted-foreground mt-0.5">Scans per day, last 30 days</p>
					<div class="mt-4">
						<DashboardActivityChart data={data.activity} />
					</div>
				</Card>
				<Card>
					<h3 class="font-serif text-base">Detections</h3>
					<p class="text-xs text-muted-foreground mt-0.5">By class, all time</p>
					<div class="mt-4">
						<DashboardClassChart data={data.classCounts} />
					</div>
				</Card>
			</div>
		</section>
	{/if}

	<section>
		<h3 class="font-serif text-lg mb-3">Recent scans</h3>
		{#if data.recent.length === 0}
			<EmptyState
				icon={CameraIcon}
				title="No scans yet"
				description="Upload your first image to get started."
			/>
		{:else}
			<div class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each data.recent as scan (scan.id)}
					<ScanCard {scan} />
				{/each}
			</div>
		{/if}
	</section>
</div>
