<script context="module" lang="ts">
	import { protectedPages } from '$lib/client/constants';
	import { initializeFirebase } from '$lib/client/firebase';
	import { browser } from '$app/env';
	import type { Load } from '@sveltejs/kit';
	export const load: Load = async function load({ session, url }) {
		if (!session.user && protectedPages.has(url.pathname)) {
			// User logged out. Send them home, not the 403 page
			return { redirect: '/', status: 302 };
		}
		if (browser) {
			try {
				initializeFirebase(session.firebaseClientConfig);
			} catch (ex) {
				console.error(ex);
			}
		}

		return {};
	};
</script>

<script lang="ts">
	import Header from '$lib/components/header/Header.svelte';
	import Auth from '$lib/components/auth/Auth.svelte';
	import '../app.css';
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
