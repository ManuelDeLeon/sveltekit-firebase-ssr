<script context="module" lang="ts">
	export async function load({ fetch, session }: any) {
		return {
			props: {
				counterData: await getCounterData(fetch, session)
			}
		};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import Counter, { getCounterData } from '$lib/components/counter/Counter.svelte';
	import type { Count } from '$lib/models/Count';
	export let counterData: Partial<Count>;
	let thisSession: any;
	$: thisSession = $session;
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>
		<div class="welcome">
			<picture>
				<source srcset="svelte-welcome.webp" type="image/webp" />
				<img src="svelte-welcome.png" alt="Welcome" />
			</picture>
		</div>

		to your new<br />
		SvelteKit + Firebase + SSR with user data<br />
		Sign in to see the counter and todos pages
	</h1>

	<h2>
		try editing <strong>src/routes/index.svelte</strong>
	</h2>

	{#if thisSession.user && counterData}
		<Counter {counterData} />
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
