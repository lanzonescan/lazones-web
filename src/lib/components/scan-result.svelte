<script lang="ts">
	import type { Detection } from '$lib/server/db/schema';

	let {
		imageUrl,
		width,
		height,
		detections,
		alt = ''
	}: {
		imageUrl: string;
		width: number;
		height: number;
		detections: Detection[];
		alt?: string;
	} = $props();

	const palette: Record<string, string> = {
		'dried-leaf': '#f5c842',
		healthy: '#4aba6b',
		'leaf-rust': '#f53d51',
		'powdery-mildew': '#66c2ff'
	};

	function colorFor(cls: string): string {
		return palette[cls] ?? '#a8b2c8';
	}
</script>

<div class="relative inline-block max-w-full">
	<img
		src={imageUrl}
		{alt}
		{width}
		{height}
		class="block max-w-full h-auto rounded-md border border-border"
	/>
	<svg
		class="absolute inset-0 w-full h-full pointer-events-none"
		viewBox="0 0 {width} {height}"
		preserveAspectRatio="none"
	>
		{#each detections as d, i (i)}
			{@const w = d.bbox[2] - d.bbox[0]}
			{@const h = d.bbox[3] - d.bbox[1]}
			<rect
				x={d.bbox[0]}
				y={d.bbox[1]}
				width={w}
				height={h}
				fill="none"
				stroke={colorFor(d.class)}
				stroke-width="3"
			/>
			<text
				x={d.bbox[0]}
				y={Math.max(d.bbox[1] - 4, 12)}
				fill={colorFor(d.class)}
				font-size="14"
				font-family="Recursive, sans-serif"
			>
				{d.class} {Math.round(d.confidence * 100)}%
			</text>
		{/each}
	</svg>
</div>
