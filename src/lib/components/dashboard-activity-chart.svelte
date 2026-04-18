<script lang="ts">
	import { AreaChart } from 'layerchart';
	import { curveMonotoneX } from 'd3-shape';
	import { onMount } from 'svelte';

	let { data }: { data: { date: Date; count: number }[] } = $props();

	let primary = $state('#b17411');

	onMount(() => {
		const update = () => {
			const v = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
			if (v) primary = v;
		};
		update();
		const observer = new MutationObserver(update);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});

	const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric'
	});

	const tickDates = $derived.by(() => {
		if (data.length === 0) return [];
		const last = data.length - 1;
		const step = Math.floor(last / 3);
		return [data[0].date, data[step].date, data[step * 2].date, data[last].date];
	});
</script>

<div class="chart-wrap h-[180px] w-full">
	<AreaChart
		{data}
		x="date"
		y="count"
		series={[{ key: 'count', value: 'count', color: primary }]}
		axis="x"
		grid={false}
		rule={false}
		props={{
			area: {
				curve: curveMonotoneX,
				fill: primary,
				fillOpacity: 0.2,
				line: {
					stroke: primary,
					'stroke-width': 2,
					curve: curveMonotoneX
				}
			},
			xAxis: {
				format: (value: Date) => shortDateFormatter.format(value),
				ticks: tickDates,
				tickLength: 0,
				tickLabelProps: { class: 'fill-[var(--muted-foreground)] text-[10px]' },
				classes: { rule: 'stroke-transparent' }
			},
			tooltip: {
				root: {
					class: 'bg-[var(--card)] border border-[var(--border)] rounded-md shadow-sm text-[var(--foreground)]'
				},
				header: { format: (value: Date) => dateFormatter.format(value) },
				item: { label: 'Scans', format: 'integer' }
			}
		}}
	/>
</div>

<style>
	.chart-wrap :global(.path-area) {
		fill: var(--primary);
		fill-opacity: 0.2;
	}
	.chart-wrap :global(.path-line) {
		fill: none;
		stroke: var(--primary);
	}
</style>
