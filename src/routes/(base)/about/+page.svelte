<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import Card from '$lib/components/card.svelte';
	import Camera from 'phosphor-svelte/lib/Camera';
	import Sparkle from 'phosphor-svelte/lib/Sparkle';
	import ClockCounterClockwise from 'phosphor-svelte/lib/ClockCounterClockwise';
	import GraduationCap from 'phosphor-svelte/lib/GraduationCap';

	let { data } = $props();
</script>

<svelte:head><title>About | Lanzones Scan</title></svelte:head>

<div class="mx-auto max-w-3xl p-6 space-y-8 fade-in">
	<PageHeader
		title="About Lanzones Scan"
		description="A tool for identifying lanzones leaf conditions from photos, built for farmers, researchers, and students."
	/>

	<section class="space-y-3">
		<Card>
			<p class="text-sm text-muted-foreground leading-relaxed">
				Lanzones Scan helps you monitor the health of lanzones trees by classifying leaf
				conditions from a single photo. Upload or capture an image, and the app flags
				whether the leaf looks healthy or shows signs of disease — so you can act early
				and track outbreaks over time.
			</p>
		</Card>
	</section>

	<section class="space-y-3">
		<h2 class="font-serif text-xl">How it works</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
			<Card>
				<div class="space-y-2">
					<Camera size={28} weight="duotone" class="text-primary" />
					<div class="font-serif text-lg">Capture</div>
					<p class="text-muted-foreground text-sm">
						Snap a photo on your phone or upload an image of a lanzones leaf.
					</p>
				</div>
			</Card>
			<Card>
				<div class="space-y-2">
					<Sparkle size={28} weight="duotone" class="text-primary" />
					<div class="font-serif text-lg">Analyze</div>
					<p class="text-muted-foreground text-sm">
						Our detection model inspects the leaf and classifies its condition.
					</p>
				</div>
			</Card>
			<Card>
				<div class="space-y-2">
					<ClockCounterClockwise size={28} weight="duotone" class="text-primary" />
					<div class="font-serif text-lg">Review</div>
					<p class="text-muted-foreground text-sm">
						Every scan is saved to your history with care tips you can revisit.
					</p>
				</div>
			</Card>
		</div>
	</section>

	<section class="space-y-3">
		<h2 class="font-serif text-xl">What we detect</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<Card>
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<span class="inline-block size-2.5 rounded-full bg-emerald-500"></span>
						<span class="font-serif text-lg">Healthy</span>
					</div>
					<p class="text-muted-foreground text-sm">Vibrant, disease-free foliage.</p>
				</div>
			</Card>
			<Card>
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<span class="inline-block size-2.5 rounded-full bg-amber-500"></span>
						<span class="font-serif text-lg">Dried leaf</span>
					</div>
					<p class="text-muted-foreground text-sm">
						Wilting or desiccated tissue, often linked to water stress.
					</p>
				</div>
			</Card>
			<Card>
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<span class="inline-block size-2.5 rounded-full bg-orange-600"></span>
						<span class="font-serif text-lg">Leaf rust</span>
					</div>
					<p class="text-muted-foreground text-sm">
						Rust-colored fungal pustules on the underside of the leaf.
					</p>
				</div>
			</Card>
			<Card>
				<div class="space-y-1">
					<div class="flex items-center gap-2">
						<span class="inline-block size-2.5 rounded-full bg-slate-400"></span>
						<span class="font-serif text-lg">Powdery mildew</span>
					</div>
					<p class="text-muted-foreground text-sm">
						A white powdery coating caused by fungal infection.
					</p>
				</div>
			</Card>
		</div>
	</section>

	<section class="space-y-3">
		<div class="flex items-center gap-2">
			<GraduationCap size={18} weight="duotone" class="text-muted-foreground" />
			<h2 class="font-serif text-xl">Team</h2>
		</div>
		<Card>
			<div class="space-y-3">
				<div class="text-xs uppercase tracking-wider text-muted-foreground">
					Developed by
				</div>
				<div class="space-y-1">
					<div class="font-semibold">Fritzie F. Baldemoro</div>
					<div class="font-semibold">Francis Kenrick O. Magallano</div>
					<div class="font-semibold">Jake Vincent B. Guinea</div>
				</div>
				<p class="text-sm text-muted-foreground">
					A capstone project — 2026.
					<span class="tabular-nums">· v{data.version}</span>
				</p>
			</div>
		</Card>
	</section>
</div>
