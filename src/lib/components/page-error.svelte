<script lang="ts">
	import ArrowLeft from 'phosphor-svelte/lib/ArrowLeft';
	import Prohibit from 'phosphor-svelte/lib/Prohibit';
	import ShieldSlash from 'phosphor-svelte/lib/ShieldSlash';
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import Clock from 'phosphor-svelte/lib/Clock';
	import Timer from 'phosphor-svelte/lib/Timer';
	import Warning from 'phosphor-svelte/lib/Warning';
	import WifiSlash from 'phosphor-svelte/lib/WifiSlash';
	import WarningCircle from 'phosphor-svelte/lib/WarningCircle';

	type Props = {
		status: number;
		message: string | undefined;
		appTitle: string;
	};

	let { status, message, appTitle }: Props = $props();

	const errorMap: Record<
		number,
		{
			icon: typeof Warning;
			title: string;
			description: string;
			badge: string;
		}
	> = {
		400: {
			icon: Prohibit,
			title: 'Bad Request',
			description: 'The request could not be understood by the server.',
			badge: 'border-border bg-secondary'
		},
		403: {
			icon: ShieldSlash,
			title: 'Access Denied',
			description: "You don't have permission to access this page.",
			badge: 'border-red-500/30 bg-[var(--red-50)]'
		},
		404: {
			icon: MagnifyingGlass,
			title: 'Page Not Found',
			description: "The page you're looking for doesn't exist or has been moved.",
			badge: 'border-[var(--primary-300)] bg-[var(--primary-50)]'
		},
		405: {
			icon: Prohibit,
			title: 'Method Not Allowed',
			description: 'This action is not supported.',
			badge: 'border-border bg-secondary'
		},
		408: {
			icon: Clock,
			title: 'Request Timeout',
			description: 'The server took too long to respond. Please try again.',
			badge: 'border-border bg-secondary'
		},
		429: {
			icon: Timer,
			title: 'Too Many Requests',
			description: "You've made too many requests. Please wait a moment and try again.",
			badge: 'border-[var(--yellow-500)]/30 bg-[var(--yellow-50)]'
		},
		500: {
			icon: Warning,
			title: 'Server Error',
			description: 'Something went wrong on our end. Please try again later.',
			badge: 'border-red-500/30 bg-[var(--red-50)]'
		},
		502: {
			icon: Warning,
			title: 'Bad Gateway',
			description: 'The server received an invalid response. Please try again later.',
			badge: 'border-red-500/30 bg-[var(--red-50)]'
		},
		503: {
			icon: WifiSlash,
			title: 'Service Unavailable',
			description: 'The service is temporarily unavailable. Please try again later.',
			badge: 'border-red-500/30 bg-[var(--red-50)]'
		}
	};

	const fallback = {
		icon: WarningCircle,
		title: 'Something Went Wrong',
		description: 'An unexpected error occurred.',
		badge: 'border-border bg-secondary'
	};

	let info = $derived(errorMap[status] ?? fallback);
	let showMessage = $derived(status >= 500 && !!message);
</script>

<svelte:head>
	<title>{appTitle} | {info.title}</title>
</svelte:head>

<div class="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-12">
	<div class="relative w-full max-w-lg">
		<span
			class="pointer-events-none absolute -top-8 left-0 font-serif text-[8rem] font-bold leading-none text-foreground opacity-[0.04] sm:text-[10rem]"
		>
			{status}
		</span>

		<div class="fade-in-up relative">
			<div class="flex items-center gap-3">
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 {info.badge}"
				>
					<info.icon size={20} />
				</div>
				<div>
					<p class="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
						Error {status}
					</p>
					<h1 class="font-serif text-xl font-bold text-foreground">
						{info.title}
					</h1>
				</div>
			</div>

			<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
				{info.description}
			</p>

			{#if showMessage}
				<div class="mt-4 border-l-2 border-border pl-3">
					<p class="font-mono text-xs text-muted-foreground">{message}</p>
				</div>
			{/if}

			<div class="mt-6 border-t-2 border-border pt-6">
				<div class="flex items-center gap-4">
					<a
						href="/"
						class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border-2 border-[var(--primary-500)] bg-[var(--primary-200)] px-5 font-serif text-sm font-bold text-foreground shadow-[3px_5px_0_0_var(--primary-500)] transition-all duration-100 hover:brightness-105 active:translate-y-0.5 active:shadow-[1px_2px_0_0_var(--primary-500)]"
					>
						<ArrowLeft size={16} />
						Go Home
					</a>
					<button
						onclick={() => history.back()}
						class="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
					>
						<ArrowLeft size={16} />
						Go back
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
