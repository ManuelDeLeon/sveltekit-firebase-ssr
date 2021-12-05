<script context="module" lang="ts">
	export async function load({ page, fetch, session, stuff }) {
		if (session.user) {
			const res = await fetch(`/data?collectionPath=counters&createIfNone=true`);
			if (res.ok) {
				const counterData = await res.json();
				return {
					props: { counterData }
				};
			}

			const { message } = await res.json();
			return {
				error: new Error(message)
			};
		} else {
			return {};
		}
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import Counter from '$lib/components/counter/Counter.svelte';
	export let counterData: Array<any> = [];
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

		to your new<br />SvelteKit app
	</h1>

	<h2>
		try editing <strong>src/routes/index.svelte</strong>
	</h2>

	{#if $session.user}
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
