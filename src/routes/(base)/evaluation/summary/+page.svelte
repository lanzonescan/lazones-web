<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '$lib/components/page-header.svelte';
	import Card from '$lib/components/card.svelte';
	import EmptyState from '$lib/components/empty-state.svelte';
	import { interpretScore } from '$lib/data/evaluation-questions';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';
	import CheckCircle from 'phosphor-svelte/lib/CheckCircle';
	import ChartBar from 'phosphor-svelte/lib/ChartBar';
	import PencilSimple from 'phosphor-svelte/lib/PencilSimple';

	let { data } = $props();

	const submitted = $derived(page.url.searchParams.has('submitted'));

	let openChars = $state<Record<string, boolean>>({});

	function toggle(id: string) {
		openChars = { ...openChars, [id]: !openChars[id] };
	}

	function barWidth(score: number) {
		return Math.max(0, Math.min(100, (score / 5) * 100));
	}

	const overallTone = $derived(interpretScore(data.overall));
	const totalRespondents = $derived(data.total);
</script>

<svelte:head><title>Evaluation Summary | Lanzones Scan</title></svelte:head>

<div class="space-y-5 sm:space-y-6 mx-auto p-3 sm:p-6 max-w-4xl fade-in">
	<PageHeader
		title="Evaluation Summary"
		description="Aggregated analysis of all submitted system quality evaluations."
	>
		{#snippet action()}
			<a
				href="/evaluation"
				class="inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm shrink-0"
			>
				<PencilSimple size={16} weight="duotone" />
				<span class="hidden sm:inline">Take evaluation</span>
				<span class="sm:hidden">Take</span>
			</a>
		{/snippet}
	</PageHeader>

	{#if submitted}
		<Card>
			<div class="flex items-start gap-3 text-sm">
				<CheckCircle size={20} weight="duotone" class="mt-0.5 text-emerald-600" />
				<div>
					<div class="font-semibold">Thank you — your evaluation was recorded.</div>
					<p class="text-muted-foreground">Your scores are now reflected in the aggregate below.</p>
				</div>
			</div>
		</Card>
	{/if}

	{#if totalRespondents === 0}
		<EmptyState
			icon={ChartBar}
			title="No evaluations yet"
			description="Once respondents submit the questionnaire, their scores will appear here as aggregated means and a verbal interpretation."
		/>
	{:else}
		<div class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
			<Card class="px-3 py-3 sm:px-5 sm:py-4">
				<div class="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
					Overall Mean
				</div>
				<div class="mt-1 flex items-baseline gap-1">
					<span class="font-serif text-2xl sm:text-3xl tabular-nums">{data.overall.toFixed(2)}</span>
					<span class="text-muted-foreground text-[10px] sm:text-xs">/ 5.00</span>
				</div>
				<div class="mt-1 text-[11px] sm:text-xs font-semibold text-{overallTone.tone}-600">
					{overallTone.label}
				</div>
			</Card>
			<Card class="px-3 py-3 sm:px-5 sm:py-4">
				<div class="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
					Respondents
				</div>
				<div class="mt-1 font-serif text-2xl sm:text-3xl tabular-nums">{totalRespondents}</div>
				<div class="mt-1 text-[11px] sm:text-xs text-muted-foreground">total submissions</div>
			</Card>
			<Card class="px-3 py-3 sm:px-5 sm:py-4">
				<div class="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
					Characteristics
				</div>
				<div class="mt-1 font-serif text-2xl sm:text-3xl tabular-nums">{data.characteristics.length}</div>
				<div class="mt-1 text-[11px] sm:text-xs text-muted-foreground">ISO/IEC dimensions</div>
			</Card>
			<Card class="px-3 py-3 sm:px-5 sm:py-4">
				<div class="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
					Strongest
				</div>
				{@const top = [...data.characteristics].sort((a, b) => b.mean - a.mean)[0]}
				<div class="mt-1 font-serif text-sm sm:text-base leading-tight">{top.name}</div>
				<div class="mt-1 text-[11px] sm:text-xs tabular-nums text-muted-foreground">
					{top.mean.toFixed(2)} avg
				</div>
			</Card>
		</div>

		<Card>
			{#snippet header()}
				<div class="font-serif text-sm sm:text-base">Respondent Mix</div>
			{/snippet}
			<div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
				{#each data.roleBreakdown as role (role.value)}
					<div>
						<div class="font-serif text-xl sm:text-2xl tabular-nums">{role.count}</div>
						<div class="text-[11px] sm:text-xs text-muted-foreground leading-tight">{role.label}</div>
					</div>
				{/each}
			</div>
		</Card>

		<section class="space-y-3">
			<h2 class="font-serif text-lg sm:text-xl">By Characteristic</h2>
			<div class="space-y-2">
				{#each data.characteristics as char (char.id)}
					{@const tone = interpretScore(char.mean)}
					{@const open = openChars[char.id]}
					<Card class="overflow-hidden p-0">
						<button
							type="button"
							onclick={() => toggle(char.id)}
							class="w-full px-3 py-3 sm:px-5 sm:py-4 text-left hover:bg-secondary/40 transition-colors duration-100 cursor-pointer"
						>
							<div class="flex items-center gap-2 sm:gap-4">
								<div class="flex-1 min-w-0">
									<div class="flex items-baseline gap-2 flex-wrap">
										<span class="font-mono text-[10px] tracking-widest text-muted-foreground">
											{char.id}
										</span>
										<span class="font-serif text-sm sm:text-base leading-tight">{char.name}</span>
									</div>
									<div class="mt-2 h-1.5 bg-(--neutral-100) rounded-full overflow-hidden">
										<div
											class="h-full bg-{tone.tone}-500 rounded-full"
											style:width="{barWidth(char.mean)}%"
										></div>
									</div>
								</div>
								<div class="flex items-center gap-2 sm:gap-3 shrink-0">
									<div class="text-right">
										<div class="font-serif text-base sm:text-lg tabular-nums leading-none">
											{char.mean.toFixed(2)}
										</div>
										<div class="mt-0.5 text-[9px] sm:text-[10px] font-semibold text-{tone.tone}-600 uppercase tracking-wider">
											{tone.label}
										</div>
									</div>
									<CaretDown
										size={14}
										class="text-muted-foreground transition-transform {open
											? 'rotate-180'
											: ''}"
									/>
								</div>
							</div>
						</button>

						{#if open}
							<div class="border-t-2 border-border bg-(--neutral-50)/40 px-3 py-3 sm:px-5 sm:py-4 space-y-4">
								<p class="text-[11px] sm:text-xs text-muted-foreground italic">{char.description}</p>
								{#each char.subs as sub (sub.id)}
									{@const subTone = interpretScore(sub.mean)}
									<div class="space-y-2">
										<div class="flex items-baseline justify-between gap-2">
											<div class="flex items-baseline gap-1.5 flex-wrap min-w-0">
												<span class="font-mono text-[10px] tracking-widest text-muted-foreground">
													{sub.id}
												</span>
												<span class="text-[13px] sm:text-sm font-semibold leading-tight">{sub.name}</span>
											</div>
											<div class="text-right shrink-0">
												<span class="font-serif tabular-nums text-sm">{sub.mean.toFixed(2)}</span>
												<span class="ml-1.5 text-[9px] sm:text-[10px] font-semibold text-{subTone.tone}-600 uppercase">
													{subTone.label}
												</span>
											</div>
										</div>
										<div class="h-1 bg-(--neutral-100) rounded-full overflow-hidden">
											<div
												class="h-full bg-{subTone.tone}-500 rounded-full"
												style:width="{barWidth(sub.mean)}%"
											></div>
										</div>
										<ul class="mt-2 space-y-1.5 pl-2.5 sm:pl-3 border-l-2 border-border">
											{#each sub.items as item (item.id)}
												<li class="flex items-start justify-between gap-2 text-[11px] sm:text-xs">
													<span class="flex-1 text-muted-foreground leading-snug">
														<span class="font-mono mr-1">{item.id.split('.').pop()}.</span>
														{item.text}
													</span>
													<span class="font-semibold tabular-nums shrink-0">
														{item.mean.toFixed(2)}
													</span>
												</li>
											{/each}
										</ul>
									</div>
								{/each}
							</div>
						{/if}
					</Card>
				{/each}
			</div>
		</section>

		{#if data.recentComments.length > 0}
			<section class="space-y-3">
				<h2 class="font-serif text-lg sm:text-xl">Recent Comments</h2>
				<div class="space-y-2">
					{#each data.recentComments as c, i (i)}
						<Card>
							<div class="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1.5">
								{c.role}
							</div>
							<p class="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap">{c.comment}</p>
						</Card>
					{/each}
				</div>
			</section>
		{/if}

		<Card>
			{#snippet header()}
				<div class="font-serif text-sm sm:text-base">Verbal Interpretation Scale</div>
			{/snippet}
			<div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
				{#each [
					{ range: '4.21 – 5.00', label: 'Excellent', tone: 'emerald' },
					{ range: '3.41 – 4.20', label: 'Very Good', tone: 'sky' },
					{ range: '2.61 – 3.40', label: 'Good', tone: 'amber' },
					{ range: '1.81 – 2.60', label: 'Fair', tone: 'orange' },
					{ range: '1.00 – 1.80', label: 'Poor', tone: 'red' }
				] as scale (scale.label)}
					<div class="rounded-md border-2 border-border px-2.5 py-2">
						<div class="font-mono text-[9px] sm:text-[10px] tracking-widest text-muted-foreground">
							{scale.range}
						</div>
						<div class="text-[11px] sm:text-xs font-semibold text-{scale.tone}-600">{scale.label}</div>
					</div>
				{/each}
			</div>
		</Card>
	{/if}
</div>
