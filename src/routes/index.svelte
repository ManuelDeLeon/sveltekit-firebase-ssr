<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import { getCounterData } from '$lib/components/counter/Counter.svelte';
	export const load: Load = async function load({ fetch, session }) {
		return {
			props: {
				counterData: await getCounterData(fetch, session)
			}
		};
	};
</script>

<script lang="ts">
	import Counter from '$lib/components/counter/Counter.svelte';
	import { session } from '$app/stores';
	import type { Count } from '$lib/models/Count';
	export let counterData: Partial<Count>;
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset="svelte-welcome.webp" type="image/webp" />
				<img src="svelte-welcome.png" alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app
	</h1>

	<h2>
		try editing <strong>src/routes/index.svelte</strong>
	</h2>

	{#if $session.user && counterData}
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
