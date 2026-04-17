<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
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
				toast.error('Oops!', {
					description: messages[0] || 'Failed to login. Please check your credentials.'
				});
				return;
			}
			if (result.status === 200) {
				toast.success('Welcome back!', {
					description: 'You have successfully logged in.'
				});
				setTimeout(() => {
					const redirectTo = page.url.searchParams.get('redirect');
					const safeRedirect =
						redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
							? redirectTo
							: '/';
					goto(safeRedirect);
				}, 100);
			}
		}
	});

	const { form: formData, enhance, errors } = $derived(form);
</script>

<form method="POST" use:enhance>
	<div class="space-y-6">
		<div class="space-y-1 text-center">
			<h1 class="font-serif text-xl">Welcome back</h1>
			<p class="text-light text-sm">Sign in to continue</p>
		</div>

		<div class="space-y-4">
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
				<div class="flex justify-between items-center">
					<label for="password" class="font-semibold text-sm">Password</label>
					<a href="/forgot-password" class="text-primary text-xs hover:underline">
						Forgot password?
					</a>
				</div>
				<PasswordInput
					id="password"
					name="password"
					autocomplete="current-password"
					placeholder="Enter your password"
					bind:value={$formData.password}
				/>
				{#if $errors.password}
					<p class="text-destructive text-sm">{$errors.password}</p>
				{/if}
			</div>
		</div>

		<LoadingButton loading={submitting} class="w-full" type="submit">
			Sign in
		</LoadingButton>
	</div>
</form>
