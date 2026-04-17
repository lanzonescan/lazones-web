<script lang="ts">
	import Card from '$lib/components/card.svelte';
	import type { Scan } from '$lib/server/db/schema';

	let { scan }: { scan: Scan } = $props();

	const topClass = $derived(
		scan.detections.length > 0
			? [...scan.detections].sort((a, b) => b.confidence - a.confidence)[0].class
			: 'no detections'
	);
</script>

<a href="/history/{scan.id}" class="block">
	<Card>
		<img
			src={scan.cloudinaryUrl}
			alt={scan.filename}
			class="w-full aspect-square object-cover rounded mb-3"
		/>
		<div class="space-y-1">
			<div class="text-sm font-semibold truncate">{scan.filename}</div>
			<div class="text-xs text-muted-foreground">{topClass}</div>
			<div class="text-xs text-muted-foreground">{new Date(scan.createdAt).toLocaleString()}</div>
		</div>
	</Card>
</a>
