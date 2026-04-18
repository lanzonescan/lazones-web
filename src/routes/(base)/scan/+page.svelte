<script lang="ts">
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/page-header.svelte';
	import LoadingButton from '$lib/components/loading-button.svelte';
	import Card from '$lib/components/card.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import CloudArrowUp from 'phosphor-svelte/lib/CloudArrowUp';
	import Camera from 'phosphor-svelte/lib/Camera';
	import UploadSimple from 'phosphor-svelte/lib/UploadSimple';
	import ImageSquare from 'phosphor-svelte/lib/ImageSquare';
	import X from 'phosphor-svelte/lib/X';
	import { toast } from 'svelte-sonner';

	let submitting = $state(false);
	let dragOver = $state(false);
	let preview: string | null = $state(null);
	let fileMeta: { name: string; size: number } | null = $state(null);
	let fileInput: HTMLInputElement;
	let cameraOpen = $state(false);
	let videoEl: HTMLVideoElement | null = $state(null);
	let stream: MediaStream | null = null;

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
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) applyFile(file);
		if (input !== fileInput) input.value = '';
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

	function stopStream() {
		if (stream) {
			for (const track of stream.getTracks()) track.stop();
			stream = null;
		}
	}

	async function openCamera() {
		if (!navigator.mediaDevices?.getUserMedia) {
			toast.error('Camera unavailable', {
				description: 'This browser does not support camera access.'
			});
			fileInput.click();
			return;
		}
		try {
			const media = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
				audio: false
			});
			stream = media;
			cameraOpen = true;
		} catch (err) {
			if (
				err instanceof DOMException &&
				(err.name === 'NotAllowedError' || err.name === 'SecurityError')
			) {
				toast.error('Camera access denied', {
					description: 'Enable camera permission in your browser settings and try again.'
				});
				return;
			}
			const message = err instanceof Error ? err.message : 'Unable to access camera.';
			toast.error('Camera unavailable', { description: message });
			fileInput.click();
		}
	}

	function closeCamera() {
		stopStream();
		cameraOpen = false;
	}

	const MAX_CAPTURE_DIM = 1600;

	function capturePhoto() {
		if (!videoEl || !stream) return;
		const vw = videoEl.videoWidth;
		const vh = videoEl.videoHeight;
		if (!vw || !vh) return;
		const scale = Math.min(1, MAX_CAPTURE_DIM / Math.max(vw, vh));
		const width = Math.round(vw * scale);
		const height = Math.round(vh * scale);
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(videoEl, 0, 0, width, height);
		canvas.toBlob(
			(blob) => {
				if (!blob) return;
				const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
				applyFile(file);
				closeCamera();
			},
			'image/jpeg',
			0.85
		);
	}

	$effect(() => {
		if (cameraOpen && videoEl && stream) {
			videoEl.srcObject = stream;
		}
	});

	$effect(() => {
		return () => stopStream();
	});
</script>

<svelte:head><title>Scan | Lanzones Scan</title></svelte:head>
<svelte:window onpaste={onPaste} />

<div class="space-y-6 mx-auto p-6 max-w-2xl fade-in">
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

			{#if cameraOpen}
				<div class="space-y-3 fade-in">
					<div class="relative bg-black border-2 border-border rounded-lg overflow-hidden">
						<video
							bind:this={videoEl}
							autoplay
							playsinline
							muted
							class="block w-full max-h-96 object-contain"
						></video>
						<button
							type="button"
							onclick={closeCamera}
							aria-label="Close camera"
							class="top-3 right-3 absolute bg-background/90 hover:bg-destructive backdrop-blur p-2 border border-border hover:border-destructive rounded-full hover:text-white transition-colors"
						>
							<X size={16} weight="bold" />
						</button>
					</div>
					<Button
						type="button"
						variant="primary"
						onclick={capturePhoto}
						class="w-full h-14 text-base"
					>
						<Camera size={22} weight="duotone" />
						Capture
					</Button>
				</div>
			{:else if !preview}
				<div class="md:hidden flex flex-col gap-3">
					<Button
						type="button"
						variant="primary"
						onclick={openCamera}
						class="w-full h-14 text-base"
					>
						<Camera size={22} weight="duotone" />
						Take photo
					</Button>
					<Button
						type="button"
						variant="secondary"
						onclick={() => fileInput.click()}
						class="w-full h-11 text-sm"
					>
						<UploadSimple size={18} weight="duotone" />
						Upload from files
					</Button>
					<div class="pt-1 text-muted-foreground/70 text-xs text-center uppercase tracking-wide">
						JPEG · PNG · WebP · up to 10 MB
					</div>
				</div>

				<div class="hidden md:block space-y-3">
					<div class="flex justify-end">
						<Button
							type="button"
							variant="secondary"
							onclick={openCamera}
							aria-label="Take photo with camera"
							class="p-0 w-10 h-10"
						>
							<Camera size={20} weight="duotone" />
						</Button>
					</div>

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
						class="absolute inset-0 opacity-40 pointer-events-none"
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

						<div class="space-y-1 text-center">
							<div class="font-serif text-foreground text-xl">
								{dragOver ? 'Release to upload' : 'Drop your image here'}
							</div>
							<div class="text-muted-foreground text-sm">
								or <span class="font-semibold text-primary">click to browse</span>
								<span class="mx-1 text-border">·</span>
								paste from clipboard
							</div>
							<div class="pt-2 text-muted-foreground/70 text-xs uppercase tracking-wide">
								JPEG · PNG · WebP · up to 10 MB
							</div>
						</div>
					</div>
				</button>
				</div>
			{:else}
				<div class="space-y-3 fade-in">
					<div
						class="relative bg-accent/20 border-2 border-border rounded-lg overflow-hidden"
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
							class="top-3 right-3 absolute bg-background/90 hover:bg-destructive backdrop-blur p-2 border border-border hover:border-destructive rounded-full hover:text-white transition-colors"
						>
							<X size={16} weight="bold" />
						</button>
					</div>

					<div class="flex justify-between items-center gap-3 text-sm">
						<div class="flex items-center gap-2 min-w-0">
							<ImageSquare
								size={16}
								weight="duotone"
								class="text-muted-foreground shrink-0"
							/>
							<span class="font-semibold truncate">{fileMeta?.name}</span>
						</div>
						<span class="tabular-nums text-muted-foreground shrink-0">
							{fileMeta ? formatSize(fileMeta.size) : ''}
						</span>
					</div>
				</div>
			{/if}

			<LoadingButton
				loading={submitting}
				type="submit"
				class="w-full"
				disabled={!preview || submitting}
			>
				{submitting ? 'Analyzing…' : preview ? 'Analyze' : 'Select an image'}
			</LoadingButton>
		</form>
	</Card>
</div>
