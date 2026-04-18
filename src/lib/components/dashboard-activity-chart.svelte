<script lang="ts">
	let { data }: { data: { date: Date; count: number }[] } = $props();

	const max = $derived(Math.max(1, ...data.map((d) => d.count)));

	const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric'
	});
	const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
	const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});

	const ticks = $derived.by(() => {
		if (data.length === 0) return [] as { label: string }[];
		const last = data.length - 1;
		const step = Math.floor(last / 3);
		return [
			{ label: shortDateFormatter.format(data[0].date) },
			{ label: shortDateFormatter.format(data[step].date) },
			{ label: shortDateFormatter.format(data[step * 2].date) },
			{ label: monthFormatter.format(data[last].date) }
		];
	});
</script>

<div class="relative">
	<div class="relative h-[120px]">
		<div
			class="absolute inset-x-0 bottom-0 border-t border-dashed border-[var(--primary-200)]"
			aria-hidden="true"
		></div>
		<div class="relative flex h-full items-end gap-[3px]">
			{#each data as d (d.date.getTime())}
				{@const isEmpty = d.count === 0}
				<div
					class="bar flex-1 rounded-t-sm"
					style:height={isEmpty ? '2px' : `${(d.count / max) * 100}%`}
					style:opacity={isEmpty ? 0.25 : 1}
					title="{fullDateFormatter.format(d.date)} · {d.count} scan{d.count === 1 ? '' : 's'}"
				></div>
			{/each}
		</div>
	</div>
	<div
		class="mt-2 flex justify-between font-mono text-[9.5px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]"
	>
		{#each ticks as tick (tick.label)}
			<span>{tick.label}</span>
		{/each}
	</div>
</div>

<style>
	.bar {
		background: linear-gradient(
			to top,
			var(--primary-400) 0%,
			var(--primary-200) 100%
		);
		min-height: 2px;
	}
</style>
