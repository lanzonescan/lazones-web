<script lang="ts">
	import { PieChart } from 'layerchart';
	import { humanizeClass } from '$lib/utils/humanize';

	let { data }: { data: { class: string; count: number }[] } = $props();

	const displayData = $derived(
		data.map((d) => ({ ...d, label: humanizeClass(d.class) }))
	);
</script>

{#if data.length > 0}
	<div class="chart-wrap h-[180px] w-full">
		<PieChart
			data={displayData}
			key="class"
			value="count"
			label="label"
			innerRadius={-28}
			cornerRadius={4}
			padAngle={0.02}
			props={{
				tooltip: {
					root: {
						class:
							'bg-[var(--card)] border border-[var(--border)] rounded-md shadow-sm text-[var(--foreground)]'
					},
					item: { format: 'integer' }
				}
			}}
		/>
	</div>
{/if}

<style>
	.chart-wrap :global(svg path.path-line) {
		fill: var(--primary-500);
		stroke: var(--card);
		stroke-width: 2;
	}
	.chart-wrap :global(svg path.path-line:nth-of-type(2)) {
		fill: var(--primary-400);
	}
	.chart-wrap :global(svg path.path-line:nth-of-type(3)) {
		fill: var(--primary-300);
	}
	.chart-wrap :global(svg path.path-line:nth-of-type(4)) {
		fill: var(--primary-600);
	}
	.chart-wrap :global(svg path.path-line:nth-of-type(5)) {
		fill: var(--primary-200);
	}
	.chart-wrap :global(svg path.path-line:nth-of-type(6)) {
		fill: var(--primary-700);
	}
</style>
