<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import Card from '$lib/components/card.svelte';
	import LoadingButton from '$lib/components/loading-button.svelte';
	import FormField from '$lib/components/form-field.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import PasswordInput from '$lib/components/ui/password-input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Checkbox from '$lib/components/ui/checkbox.svelte';
	import TrashIcon from 'phosphor-svelte/lib/Trash';
	import UserIcon from 'phosphor-svelte/lib/User';
	import LockIcon from 'phosphor-svelte/lib/Lock';
	import WarningIcon from 'phosphor-svelte/lib/Warning';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { deleteSchema, nameSchema, passwordSchema } from './schema';

	let { data } = $props();

	let confirmDelete = $state(false);

	const nameForm = superForm(untrack(() => data.nameForm), {
		id: 'name',
		validators: zod4(nameSchema),
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				const m = result.data?.form?.errors?.messages;
				toast.error('Update failed', {
					description: Array.isArray(m) && m[0] ? m[0] : 'Try again.'
				});
			} else if (result.status === 200) {
				toast.success('Saved', { description: 'Name updated.' });
			}
		}
	});

	const passwordForm = superForm(untrack(() => data.passwordForm), {
		id: 'password',
		validators: zod4(passwordSchema),
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				const m = result.data?.form?.errors?.messages;
				toast.error('Update failed', {
					description: Array.isArray(m) && m[0] ? m[0] : 'Try again.'
				});
			} else if (result.status === 200) {
				toast.success('Password changed');
			}
		}
	});

	const deleteForm = superForm(untrack(() => data.deleteForm), {
		id: 'delete',
		validators: zod4(deleteSchema),
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				const m = result.data?.form?.errors?.messages;
				toast.error('Could not delete', {
					description: Array.isArray(m) && m[0] ? m[0] : 'Try again.'
				});
			}
		}
	});

	const {
		form: nData,
		enhance: nEnhance,
		errors: nErrors,
		submitting: nSubmitting
	} = $derived(nameForm);
	const {
		form: pData,
		enhance: pEnhance,
		errors: pErrors,
		submitting: pSubmitting
	} = $derived(passwordForm);
	const {
		form: dData,
		enhance: dEnhance,
		errors: dErrors,
		submitting: dSubmitting
	} = $derived(deleteForm);

	function formatDate(d: Date | string | null | undefined) {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head><title>Profile | Lanzones Scan</title></svelte:head>

<div class="mx-auto max-w-3xl p-6 space-y-8 fade-in">
	<PageHeader title="Your profile" description="Manage your account." />

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
		<Card>
			<div class="text-xs uppercase tracking-wider text-muted-foreground">Email</div>
			<div class="font-semibold truncate mt-1">{data.user?.email}</div>
		</Card>
		<Card>
			<div class="text-xs uppercase tracking-wider text-muted-foreground">
				Member since
			</div>
			<div class="font-serif text-lg mt-1">{formatDate(data.user?.createdAt)}</div>
		</Card>
		<Card>
			<div class="text-xs uppercase tracking-wider text-muted-foreground">
				Total scans
			</div>
			<div class="font-serif text-2xl mt-1">{data.total}</div>
		</Card>
	</div>

	<section class="space-y-3">
		<div class="flex items-center gap-2">
			<UserIcon size={18} weight="duotone" class="text-muted-foreground" />
			<h2 class="font-serif text-xl">Identity</h2>
		</div>
		<Card>
			<form method="POST" action="?/updateName" use:nEnhance class="space-y-4">
				<FormField label="Name" id="profile-name" error={$nErrors.name}>
					<Input
						id="profile-name"
						name="name"
						type="text"
						autocomplete="name"
						bind:value={$nData.name}
					/>
				</FormField>
				<div class="space-y-1.5">
					<Label>Email</Label>
					<div
						class="px-3 py-2 rounded-md border border-border bg-muted/50 text-muted-foreground text-sm"
					>
						{data.user?.email}
					</div>
					<p class="text-xs text-muted-foreground">Email can't be changed.</p>
				</div>
				<div class="flex justify-end pt-2">
					<LoadingButton loading={$nSubmitting} type="submit">Save changes</LoadingButton>
				</div>
			</form>
		</Card>
	</section>

	<section class="space-y-3">
		<div class="flex items-center gap-2">
			<LockIcon size={18} weight="duotone" class="text-muted-foreground" />
			<h2 class="font-serif text-xl">Password</h2>
		</div>
		<Card>
			<form method="POST" action="?/changePassword" use:pEnhance class="space-y-4">
				<div class="space-y-1.5">
					<Label for="current-password">Current password</Label>
					<PasswordInput
						id="current-password"
						name="currentPassword"
						autocomplete="current-password"
						bind:value={$pData.currentPassword}
					/>
					{#if $pErrors.currentPassword}
						<p class="text-destructive text-sm">{$pErrors.currentPassword}</p>
					{/if}
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-1.5">
						<Label for="new-password">New password</Label>
						<PasswordInput
							id="new-password"
							name="newPassword"
							autocomplete="new-password"
							bind:value={$pData.newPassword}
						/>
						{#if $pErrors.newPassword}
							<p class="text-destructive text-sm">{$pErrors.newPassword}</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="confirm-password">Confirm</Label>
						<PasswordInput
							id="confirm-password"
							name="confirmPassword"
							autocomplete="new-password"
							bind:value={$pData.confirmPassword}
						/>
						{#if $pErrors.confirmPassword}
							<p class="text-destructive text-sm">{$pErrors.confirmPassword}</p>
						{/if}
					</div>
				</div>
				<label class="flex items-center gap-2 text-sm cursor-pointer select-none">
					<Checkbox
						name="revokeOtherSessions"
						bind:checked={$pData.revokeOtherSessions}
					/>
					Sign out of all other sessions
				</label>
				<div class="flex justify-end pt-2">
					<LoadingButton loading={$pSubmitting} type="submit">
						Update password
					</LoadingButton>
				</div>
			</form>
		</Card>
	</section>

	<section class="space-y-3">
		<div class="flex items-center gap-2">
			<WarningIcon size={18} weight="duotone" class="text-destructive" />
			<h2 class="font-serif text-xl text-destructive">Danger zone</h2>
		</div>
		<div
			class="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-5 space-y-3"
		>
			<div>
				<h3 class="font-serif text-lg">Delete your account</h3>
				<p class="text-sm text-muted-foreground mt-1">
					Permanently removes your account, all scans, and associated images. This
					action cannot be undone.
				</p>
			</div>

			{#if !confirmDelete}
				<button
					type="button"
					onclick={() => (confirmDelete = true)}
					class="inline-flex items-center gap-2 text-sm font-semibold text-destructive hover:underline"
				>
					<TrashIcon size={14} weight="bold" /> Delete account…
				</button>
			{:else}
				<form
					method="POST"
					action="?/deleteAccount"
					use:dEnhance
					class="space-y-3 pt-2 border-t border-destructive/20"
				>
					<div class="space-y-1.5">
						<Label for="delete-email">
							Type your email <span class="text-muted-foreground font-normal">
								({data.user?.email})
							</span>
						</Label>
						<Input
							id="delete-email"
							name="email"
							type="email"
							autocomplete="off"
							placeholder="you@example.com"
							bind:value={$dData.email}
						/>
						{#if $dErrors.email}
							<p class="text-destructive text-sm">{$dErrors.email}</p>
						{/if}
					</div>
					<div class="space-y-1.5">
						<Label for="delete-password">Password</Label>
						<PasswordInput
							id="delete-password"
							name="password"
							autocomplete="current-password"
							bind:value={$dData.password}
						/>
						{#if $dErrors.password}
							<p class="text-destructive text-sm">{$dErrors.password}</p>
						{/if}
					</div>
					<div class="flex gap-2 pt-2">
						<button
							type="button"
							onclick={() => (confirmDelete = false)}
							class="text-sm font-semibold text-muted-foreground hover:text-foreground"
						>
							Cancel
						</button>
						<div class="grow"></div>
						<LoadingButton
							loading={$dSubmitting}
							type="submit"
							variant="destructive"
						>
							Permanently delete
						</LoadingButton>
					</div>
				</form>
			{/if}
		</div>
	</section>

	<div class="pt-4 text-center">
		<a
			href="/about"
			class="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
		>
			Learn more about Lanzones Scan →
		</a>
	</div>
</div>
