<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import ScanResult from '$lib/components/scan-result.svelte';
	import Card from '$lib/components/card.svelte';
	import { humanizeClass, relativeTime } from '$lib/utils/humanize';

	let { data } = $props();

	const sorted = $derived([...data.scan.detections].sort((a, b) => b.confidence - a.confidence));
	const topLabel = $derived(sorted.length > 0 ? humanizeClass(sorted[0].class) : 'Scan detail');
	const advice = $derived(data.scan.advice);
</script>

<svelte:head><title>Scan detail | Lanzones Scan</title></svelte:head>

<div class="mx-auto max-w-5xl p-6 space-y-6 fade-in">
	<PageHeader title={topLabel} description={relativeTime(data.scan.createdAt)} />

	<div class="flex justify-center">
		<ScanResult
			imageUrl={data.scan.cloudinaryUrl}
			width={data.scan.imageWidth}
			height={data.scan.imageHeight}
			detections={data.scan.detections}
			alt={data.scan.filename}
		/>
	</div>

	<Card>
		<h3 class="font-serif text-lg mb-2">Detections</h3>
		{#if sorted.length === 0}
			<p class="text-muted-foreground text-sm">No detections above confidence threshold.</p>
		{:else}
			<ul class="divide-y divide-border">
				{#each sorted as d, i (i)}
					<li class="py-2 flex justify-between text-sm">
						<span class="font-semibold">{humanizeClass(d.class)}</span>
						<span class="text-muted-foreground">{Math.round(d.confidence * 100)}%</span>
					</li>
				{/each}
			</ul>
		{/if}
	</Card>

	{#if advice}
		<Card>
			{#snippet header()}
				<div class="flex items-baseline justify-between">
					<span class="font-serif text-base">Care tips for {advice.label}</span>
					<span class="text-muted-foreground text-xs uppercase tracking-wide">{advice.class}</span>
				</div>
			{/snippet}
			<p class="text-sm text-muted-foreground mb-3">{advice.summary}</p>
			<ul class="space-y-2 text-sm list-disc pl-5 marker:text-muted-foreground">
				{#each advice.tips as tip (tip)}
					<li>{tip}</li>
				{/each}
			</ul>
		</Card>
	{/if}

	<a href="/history" class="inline-block text-primary hover:underline">← Back to history</a>
</div>
