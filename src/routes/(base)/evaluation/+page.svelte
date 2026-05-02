<script lang="ts">
	import { enhance } from '$app/forms';
	import { Select } from 'bits-ui';
	import PageHeader from '$lib/components/page-header.svelte';
	import Card from '$lib/components/card.svelte';
	import { Button } from '$lib/components/ui';
	import {
		LIKERT_OPTIONS,
		QUESTIONS,
		RESPONDENT_ROLES,
		type LikertScore,
		type ResponseMap
	} from '$lib/data/evaluation-questions';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';
	import ChartBar from 'phosphor-svelte/lib/ChartBar';
	import Check from 'phosphor-svelte/lib/Check';
	import CheckCircle from 'phosphor-svelte/lib/CheckCircle';
	import Warning from 'phosphor-svelte/lib/Warning';

	let { data, form } = $props();

	// svelte-ignore state_referenced_locally
	const initialResponses = (data.existing?.responses as ResponseMap | undefined) ?? {};
	// svelte-ignore state_referenced_locally
	const initialRole = data.existing?.respondentRole ?? '';
	// svelte-ignore state_referenced_locally
	const initialComments = data.existing?.comments ?? '';

	let responses = $state<ResponseMap>({ ...initialResponses });
	let role = $state<string>(initialRole);
	let comments = $state<string>(initialComments);
	let submitting = $state(false);

	const totalItems = QUESTIONS.reduce(
		(sum, c) => sum + c.subs.reduce((s, sub) => s + sub.items.length, 0),
		0
	);

	const answeredCount = $derived(Object.keys(responses).length);
	const progress = $derived(Math.round((answeredCount / totalItems) * 100));
	const roleLabel = $derived(
		RESPONDENT_ROLES.find((r) => r.value === role)?.label ?? ''
	);

	function setScore(itemId: string, score: LikertScore) {
		responses = { ...responses, [itemId]: score };
	}
</script>

<svelte:head><title>Evaluation | Lanzones Scan</title></svelte:head>

<div class="space-y-5 sm:space-y-6 mx-auto p-3 sm:p-6 max-w-4xl fade-in">
	<PageHeader
		title="System Quality Evaluation"
		description="ISO/IEC 25010-aligned survey covering 9 quality characteristics. Rate each statement from 1 to 5."
	>
		{#snippet action()}
			<a
				href="/evaluation/summary"
				class="inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground text-xs sm:text-sm shrink-0"
			>
				<ChartBar size={16} weight="duotone" />
				<span class="hidden sm:inline">View summary</span>
				<span class="sm:hidden">Summary</span>
			</a>
		{/snippet}
	</PageHeader>

	{#if data.existing}
		<Card>
			<div class="flex items-start gap-3 text-sm">
				<CheckCircle size={20} weight="duotone" class="mt-0.5 text-emerald-600" />
				<div>
					<div class="font-semibold">You already submitted an evaluation.</div>
					<p class="text-muted-foreground">
						Your previous answers are pre-filled below — submitting again will replace
						them.
					</p>
				</div>
			</div>
		</Card>
	{/if}

	{#if form?.error}
		<Card>
			<div class="flex items-start gap-3 text-sm text-destructive">
				<Warning size={20} weight="duotone" class="mt-0.5" />
				<div>{form.error}</div>
			</div>
		</Card>
	{/if}

	<div
		class="sticky top-14 z-30 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2.5 sm:py-3 backdrop-blur bg-(--white)/85 border-b border-border"
	>
		<div class="flex items-center justify-between gap-3 text-xs">
			<span class="text-muted-foreground">
				Answered <span class="font-semibold text-foreground tabular-nums">{answeredCount}</span> /
				<span class="tabular-nums">{totalItems}</span>
			</span>
			<span class="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
				{progress}%
			</span>
		</div>
		<div class="mt-1.5 h-1.5 bg-(--neutral-100) rounded-full overflow-hidden">
			<div
				class="h-full bg-[var(--primary-500)] rounded-full transition-[width] duration-200"
				style:width="{progress}%"
			></div>
		</div>
	</div>

	<form method="POST" use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}} class="space-y-8">
		<Card>
			{#snippet header()}
				<div class="font-serif text-base">Respondent Profile</div>
			{/snippet}
			<div class="space-y-4">
				<div>
					<label
						for="respondentRole-trigger"
						class="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
					>
						I am primarily a…
					</label>
					<Select.Root
						type="single"
						name="respondentRole"
						required
						bind:value={role}
						items={RESPONDENT_ROLES.map((r) => ({ value: r.value, label: r.label }))}
					>
						<Select.Trigger
							id="respondentRole-trigger"
							class="flex items-center justify-between w-full bg-(--white) border-2 border-border rounded-lg px-3 py-2 text-sm transition-colors duration-100 focus-visible:outline-none focus-visible:border-[var(--primary-500)] data-[state=open]:border-[var(--primary-500)] data-[placeholder]:text-muted-foreground"
							aria-label="Choose respondent role"
						>
							<span class={role ? '' : 'text-muted-foreground'}>
								{roleLabel || 'Choose one…'}
							</span>
							<CaretDown size={14} class="text-muted-foreground" />
						</Select.Trigger>
						<Select.Portal>
							<Select.Content
								sideOffset={6}
								class="z-50 w-(--bits-select-anchor-width) min-w-(--bits-select-anchor-width) overflow-hidden rounded-lg border-2 border-border bg-(--white) p-1.5 shadow-offset outline-none"
							>
								<Select.Viewport>
									{#each RESPONDENT_ROLES as opt (opt.value)}
										<Select.Item
											value={opt.value}
											label={opt.label}
											class="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm cursor-pointer outline-none transition-colors duration-75 data-[highlighted]:bg-[var(--primary-200)] data-[highlighted]:text-[var(--primary-700)] data-[selected]:font-semibold"
										>
											{#snippet children({ selected })}
												<span>{opt.label}</span>
												{#if selected}
													<Check size={14} class="text-[var(--primary-500)]" />
												{/if}
											{/snippet}
										</Select.Item>
									{/each}
								</Select.Viewport>
							</Select.Content>
						</Select.Portal>
					</Select.Root>
				</div>
			</div>
		</Card>

		{#each QUESTIONS as char, ci (char.id)}
			<section class="space-y-3">
				<div class="flex items-baseline gap-2 sm:gap-3 flex-wrap">
					<span
						class="font-mono text-[10px] sm:text-[11px] tracking-widest text-muted-foreground"
					>
						{String(ci + 1).padStart(2, '0')} · {char.id}
					</span>
					<h2 class="font-serif text-lg sm:text-xl">{char.name}</h2>
				</div>
				<p class="text-xs sm:text-sm text-muted-foreground">{char.description}</p>

				<div class="space-y-3">
					{#each char.subs as sub (sub.id)}
						<Card>
							{#snippet header()}
								<div>
									<div class="font-serif text-sm sm:text-base">
										{sub.id.split('.')[1]}. {sub.name}
									</div>
									<p class="mt-0.5 text-[11px] sm:text-xs text-muted-foreground">{sub.description}</p>
								</div>
							{/snippet}

							<div class="space-y-5 sm:space-y-4">
								{#each sub.items as item (item.id)}
									<div class="space-y-2">
										<div class="flex items-start gap-2 text-[13px] sm:text-sm leading-snug">
											<span class="font-mono text-[10px] sm:text-[11px] mt-0.5 text-muted-foreground shrink-0">
												{item.id.split('.').pop()}.
											</span>
											<span>{item.text}</span>
										</div>
										<div
											class="grid grid-cols-5 gap-1 sm:gap-1.5"
											role="radiogroup"
											aria-label={item.text}
										>
											{#each LIKERT_OPTIONS as opt (opt.value)}
												{@const selected = responses[item.id] === opt.value}
												<label
													class="flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-2 px-0.5 sm:px-1 min-h-[52px] sm:min-h-[60px] rounded-md border-2 cursor-pointer text-center transition-all duration-100 {selected
														? 'border-[var(--primary-500)] bg-[var(--primary-200)]/40 shadow-[1px_2px_0_0_var(--primary-500)]'
														: 'border-border bg-(--white) hover:bg-secondary active:scale-[0.97]'}"
												>
													<input
														type="radio"
														name={item.id}
														value={opt.value}
														checked={selected}
														onchange={() => setScore(item.id, opt.value as LikertScore)}
														class="sr-only"
														required
													/>
													<span class="font-serif text-base sm:text-lg font-bold">{opt.value}</span>
													<span class="hidden sm:block text-[10px] leading-tight text-muted-foreground">
														{opt.label}
													</span>
												</label>
											{/each}
										</div>
										<div class="flex justify-between text-[9px] sm:hidden font-mono tracking-wider text-muted-foreground/80 px-0.5">
											<span>Disagree</span>
											<span>Agree</span>
										</div>
									</div>
								{/each}
							</div>
						</Card>
					{/each}
				</div>
			</section>
		{/each}

		<Card>
			{#snippet header()}
				<div class="font-serif text-base">Optional Comments</div>
			{/snippet}
			<textarea
				name="comments"
				bind:value={comments}
				rows="4"
				placeholder="Suggestions, observations, or anything else worth noting…"
				class="w-full bg-(--white) border-2 border-border rounded-lg px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:border-[var(--primary-500)] resize-y"
			></textarea>
		</Card>

		<div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 sticky bottom-16 md:bottom-0 -mx-3 sm:mx-0 px-3 sm:px-0 py-3 sm:py-0 bg-(--white)/95 sm:bg-transparent backdrop-blur sm:backdrop-blur-none border-t-2 sm:border-t-0 border-border z-40">
			<p class="text-xs text-muted-foreground text-center sm:text-left">
				{#if answeredCount < totalItems}
					{totalItems - answeredCount} item{totalItems - answeredCount === 1 ? '' : 's'} remaining.
				{:else}
					All items answered. Ready to submit.
				{/if}
			</p>
			<Button type="submit" class="w-full sm:w-auto" disabled={submitting || answeredCount < totalItems}>
				{submitting ? 'Submitting…' : data.existing ? 'Update evaluation' : 'Submit evaluation'}
			</Button>
		</div>
	</form>
</div>
