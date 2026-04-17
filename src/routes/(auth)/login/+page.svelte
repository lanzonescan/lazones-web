<script lang="ts">
	import { PUBLIC_APP_TITLE } from '$env/static/public';
	import Form from './form.svelte';

	let { data = $bindable() } = $props();
</script>

<svelte:head>
	<title>{PUBLIC_APP_TITLE} | Sign In</title>
	<meta name="description" content="Sign in to your account" />
</svelte:head>

<div class="flex flex-col justify-center items-center gap-8 px-6 py-8 min-h-screen fade-in">
	<div class="flex flex-col items-center gap-3">
		<img
			src="/favicon.png"
			alt={PUBLIC_APP_TITLE}
			class="size-16 rounded-2xl shadow-offset border-2 border-border"
		/>
		<h2 class="font-serif text-foreground text-2xl">{PUBLIC_APP_TITLE}</h2>
	</div>
	<div class="bg-background shadow-offset p-8 border-2 border-border rounded-lg w-full max-w-md">
		<Form field={data.form} />
		<p class="mt-4 text-sm text-center">
			Don't have an account?
			<a href="/signup" class="text-primary hover:underline">Sign up</a>
		</p>
	</div>
</div>
