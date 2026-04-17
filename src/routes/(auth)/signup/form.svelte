<script lang="ts">
	import { goto } from '$app/navigation';
	import FormField from '$lib/components/form-field.svelte';
	import LoadingButton from '$lib/components/loading-button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import PasswordInput from '$lib/components/ui/password-input.svelte';
	import { toast } from 'svelte-sonner';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { schema, type Schema } from './schema';

	let { field = $bindable() }: { field: SuperValidated<Infer<Schema>> } = $props();

	let submitting = $state(false);

	const form = superForm(field, {
		autoFocusOnError: true,
		validators: zod4(schema),
		onSubmit: () => (submitting = true),
		onUpdate: () => (submitting = false),
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				const messages = result.data?.form?.errors?.messages;
				if (!messages || !Array.isArray(messages) || messages.length === 0) return;
				toast.error('Signup failed', {
					description: messages[0] || 'Unable to create account. Try again.'
				});
				return;
			}
			if (result.status === 200) {
				toast.success('Welcome!', { description: 'Your account is ready.' });
				setTimeout(() => goto('/'), 100);
			}
		}
	});

	const { form: formData, enhance, errors } = $derived(form);
</script>

<form method="POST" use:enhance>
	<div class="space-y-6">
		<div class="space-y-1 text-center">
			<h1 class="font-serif text-xl">Create your account</h1>
			<p class="text-light text-sm">Start scanning in a minute</p>
		</div>

		<div class="space-y-4">
			<FormField label="Name" id="name" error={$errors.name}>
				<Input
					id="name"
					name="name"
					type="text"
					autocomplete="name"
					placeholder="Juan Dela Cruz"
					bind:value={$formData.name}
				/>
			</FormField>

			<FormField label="Email" id="email" error={$errors.email}>
				<Input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					placeholder="you@example.com"
					bind:value={$formData.email}
				/>
			</FormField>

			<div class="space-y-2">
				<label for="password" class="font-semibold text-sm">Password</label>
				<PasswordInput
					id="password"
					name="password"
					autocomplete="new-password"
					placeholder="At least 8 characters"
					bind:value={$formData.password}
				/>
				{#if $errors.password}
					<p class="text-destructive text-sm">{$errors.password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="confirmPassword" class="font-semibold text-sm">Confirm password</label>
				<PasswordInput
					id="confirmPassword"
					name="confirmPassword"
					autocomplete="new-password"
					placeholder="Re-enter password"
					bind:value={$formData.confirmPassword}
				/>
				{#if $errors.confirmPassword}
					<p class="text-destructive text-sm">{$errors.confirmPassword}</p>
				{/if}
			</div>
		</div>

		<LoadingButton loading={submitting} class="w-full" type="submit">
			Create account
		</LoadingButton>
	</div>
</form>
