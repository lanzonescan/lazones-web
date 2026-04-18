<script lang="ts">
	import type { Scan } from '$lib/server/db/schema';
	import { humanizeClass, shortRelativeTime } from '$lib/utils/humanize';

	let { scan }: { scan: Scan } = $props();

	const top = $derived(
		scan.detections.length > 0
			? [...scan.detections].sort((a, b) => b.confidence - a.confidence)[0]
			: null
	);

	const label = $derived(top ? humanizeClass(top.class) : 'No detections');
	const count = $derived(scan.detections.length);
	const when = $derived(shortRelativeTime(scan.createdAt));
</script>

<a
	href="/history/{scan.id}"
	class="group block overflow-hidden rounded-lg border-2 border-border bg-[var(--white)] shadow-offset transition-all duration-150 hover:-translate-y-0.5 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
>
	<div class="relative">
		<img
			src={scan.cloudinaryUrl}
			alt={label}
			class="aspect-[4/5] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
			loading="lazy"
		/>
		{#if top}
			<span
				class="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm"
			>
				{Math.round(top.confidence * 100)}%
			</span>
		{/if}
	</div>
	<div class="px-3.5 py-3">
		<h3 class="truncate font-serif text-base leading-tight text-foreground">
			{label}
		</h3>
		<p class="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground whitespace-normal break-words">
			{count}
			{count === 1 ? 'detection' : 'detections'}
			<span class="mx-1 opacity-50">·</span>
			{when}
		</p>
	</div>
</a>
