<script lang="ts">
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/page-header.svelte';
	import LoadingButton from '$lib/components/loading-button.svelte';
	import Card from '$lib/components/card.svelte';
	import CloudArrowUp from 'phosphor-svelte/lib/CloudArrowUp';
	import ImageSquare from 'phosphor-svelte/lib/ImageSquare';
	import X from 'phosphor-svelte/lib/X';
	import { toast } from 'svelte-sonner';

	let submitting = $state(false);
	let dragOver = $state(false);
	let preview: string | null = $state(null);
	let fileMeta: { name: string; size: number } | null = $state(null);
	let fileInput: HTMLInputElement;

	const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
	const MAX_SIZE = 10 * 1024 * 1024;

	function formatSize(bytes: number) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function validate(file: File): string | null {
		if (!ACCEPTED.includes(file.type)) return 'Only JPEG, PNG, or WebP.';
		if (file.size > MAX_SIZE) return 'Max size is 10 MB.';
		return null;
	}

	function applyFile(file: File) {
		const err = validate(file);
		if (err) {
			toast.error('Invalid file', { description: err });
			return;
		}
		if (preview) URL.revokeObjectURL(preview);
		preview = URL.createObjectURL(file);
		fileMeta = { name: file.name, size: file.size };
		const dt = new DataTransfer();
		dt.items.add(file);
		fileInput.files = dt.files;
	}

	function onInputChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) applyFile(file);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) applyFile(file);
	}

	function onDragEnter(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDragLeave(e: DragEvent) {
		if (e.target === e.currentTarget) dragOver = false;
	}

	function onPaste(e: ClipboardEvent) {
		const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
			i.type.startsWith('image/')
		);
		if (!item) return;
		const file = item.getAsFile();
		if (!file) return;
		const named = new File([file], `pasted-${Date.now()}.png`, { type: file.type });
		applyFile(named);
		toast.success('Pasted from clipboard');
	}

	function clearPreview() {
		if (preview) URL.revokeObjectURL(preview);
		preview = null;
		fileMeta = null;
		fileInput.value = '';
	}
</script>

<svelte:head><title>Scan | Lanzones Scan</title></svelte:head>
<svelte:window onpaste={onPaste} />

<div class="mx-auto max-w-2xl p-6 space-y-6 fade-in">
	<PageHeader
		title="New scan"
		description="Drop, paste, or browse an image of your lanzones specimen for analysis."
	/>

	<Card>
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				submitting = true;
				return async ({ result, update }) => {
					submitting = false;
					await update();
					if (result.type === 'failure') {
						toast.error('Scan failed', {
							description: (result.data?.error as string) ?? 'Please retry.'
						});
					}
				};
			}}
			class="space-y-5"
		>
			<input
				bind:this={fileInput}
				type="file"
				name="file"
				accept="image/jpeg,image/png,image/webp"
				class="sr-only"
				onchange={onInputChange}
				tabindex="-1"
			/>

			{#if !preview}
				<button
					type="button"
					onclick={() => fileInput.click()}
					ondrop={onDrop}
					ondragenter={onDragEnter}
					ondragover={onDragOver}
					ondragleave={onDragLeave}
					aria-label="Upload image"
					class="group relative block w-full overflow-hidden rounded-lg border-2 border-dashed p-10 text-left cursor-pointer transition-all duration-200 {dragOver
						? 'border-primary bg-primary/5'
						: 'border-border bg-accent/20 hover:bg-accent/40 hover:border-neutral-400'}"
				>
					<div
						class="pointer-events-none absolute inset-0 opacity-40"
						style="background-image: radial-gradient(circle, var(--neutral-300) 1px, transparent 1px); background-size: 14px 14px;"
					></div>

					<div class="relative flex flex-col items-center gap-4">
						<div class="relative">
							<div
								class="absolute inset-0 rounded-full bg-primary/15 blur-2xl transition-transform duration-300 {dragOver
									? 'scale-150'
									: 'scale-100 group-hover:scale-110'}"
							></div>
							<CloudArrowUp
								size={56}
								weight="duotone"
								class="relative transition-all duration-200 {dragOver
									? 'text-primary scale-110'
									: 'text-muted-foreground group-hover:text-foreground'}"
							/>
						</div>

						<div class="text-center space-y-1">
							<div class="font-serif text-xl text-foreground">
								{dragOver ? 'Release to upload' : 'Drop your image here'}
							</div>
							<div class="text-sm text-muted-foreground">
								or <span class="text-primary font-semibold">click to browse</span>
								<span class="mx-1 text-border">·</span>
								paste from clipboard
							</div>
							<div class="text-xs text-muted-foreground/70 pt-2 tracking-wide uppercase">
								JPEG · PNG · WebP · up to 10 MB
							</div>
						</div>
					</div>
				</button>
			{:else}
				<div class="space-y-3 fade-in">
					<div
						class="relative rounded-lg overflow-hidden border-2 border-border bg-accent/20"
					>
						<img
							src={preview}
							alt="preview"
							class="block w-full max-h-96 object-contain"
						/>
						<button
							type="button"
							onclick={clearPreview}
							aria-label="Remove image"
							class="absolute top-3 right-3 rounded-full border border-border bg-background/90 p-2 backdrop-blur transition-colors hover:bg-destructive hover:text-white hover:border-destructive"
						>
							<X size={16} weight="bold" />
						</button>
					</div>

					<div class="flex items-center justify-between gap-3 text-sm">
						<div class="flex items-center gap-2 min-w-0">
							<ImageSquare
								size={16}
								weight="duotone"
								class="shrink-0 text-muted-foreground"
							/>
							<span class="truncate font-semibold">{fileMeta?.name}</span>
						</div>
						<span class="shrink-0 text-muted-foreground tabular-nums">
							{fileMeta ? formatSize(fileMeta.size) : ''}
						</span>
					</div>
				</div>
			{/if}

			<LoadingButton
				loading={submitting}
				type="submit"
				class="w-full"
				disabled={!preview}
			>
				{submitting ? 'Analyzing…' : preview ? 'Analyze' : 'Select an image'}
			</LoadingButton>
		</form>
	</Card>
</div>
