<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import Card from '$lib/components/card.svelte';
	import ScanCard from '$lib/components/scan-card.svelte';
	import ScanCardSkeleton from '$lib/components/scan-card-skeleton.svelte';
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
						{#await data.activity}
							<div class="relative">
								<div class="relative h-[120px]">
									<div
										class="absolute inset-x-0 bottom-0 border-t border-dashed border-[var(--neutral-200)]"
										aria-hidden="true"
									></div>
									<div class="relative flex h-full items-end gap-[3px] animate-pulse">
										{#each Array(30) as _, i (i)}
											<div
												class="flex-1 rounded-t-sm bg-[var(--neutral-200)]"
												style:height="{8 + ((i * 37) % 60)}%"
											></div>
										{/each}
									</div>
								</div>
								<div class="mt-2 flex justify-between">
									{#each Array(4) as _, i (i)}
										<div class="h-2.5 w-8 rounded bg-[var(--neutral-200)] animate-pulse"></div>
									{/each}
								</div>
							</div>
						{:then activity}
							<DashboardActivityChart data={activity} />
						{/await}
					</div>
				</Card>
				<Card>
					<h3 class="font-serif text-base">Detections</h3>
					<p class="text-xs text-muted-foreground mt-0.5">By class, all time</p>
					<div class="mt-4">
						{#await data.classCounts}
							<div class="flex h-[180px] items-center justify-center animate-pulse">
								<div class="relative size-[130px]">
									<div
										class="absolute inset-0 rounded-full border-[18px] border-[var(--neutral-200)]"
									></div>
								</div>
							</div>
						{:then classCounts}
							<DashboardClassChart data={classCounts} />
						{/await}
					</div>
				</Card>
			</div>
		</section>
	{/if}

	<section>
		<div class="flex items-center justify-between mb-3">
			<h3 class="font-serif text-lg">Recent scans</h3>
			{#await data.recent then recent}
				{#if recent.length > 0}
					<a href="/history" class="text-sm text-primary hover:underline">View all →</a>
				{/if}
			{/await}
		</div>
		{#await data.recent}
			<div class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each Array(4) as _, i (i)}
					<ScanCardSkeleton />
				{/each}
			</div>
		{:then recent}
			{#if recent.length === 0}
				<EmptyState
					icon={CameraIcon}
					title="No scans yet"
					description="Upload your first image to get started."
				/>
			{:else}
				<div class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{#each recent as scan (scan.id)}
						<ScanCard {scan} />
					{/each}
				</div>
			{/if}
		{/await}
	</section>
</div>
