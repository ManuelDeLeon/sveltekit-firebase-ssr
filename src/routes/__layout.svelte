<script context="module" lang="ts">
	import { publicPages } from '$lib/utils/constants';
	export async function load({ page, fetch, session, stuff }) {
		if (!session.user && !publicPages.includes(page.path)) {
			return { redirect: '/', status: 302 };
		} else {
			return {};
		}
	}
</script>

<script lang="ts">
	import Header from '$lib/components/header/Header.svelte';
	import '../app.css';
	import { browser } from '$app/env';
	import { listenForAuthChanges } from '$lib/utils/firebase';
	import Auth from '$lib/components/Auth/Auth.svelte';

	if (browser) {
		listenForAuthChanges();
	}
</script>

<Header />

<main>
	<Auth />

	<slot />
</main>

<footer>
	<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
