<script lang="ts">
	import Header from './Header.svelte';
	import Auth from '$lib/components/auth/Auth.svelte';
	import './styles.css';
	import { browser } from '$app/environment';
	import { initializeFirebase } from '$lib/client/firebase';
	import { PUBLIC_FIREBASE_CLIENT_CONFIG } from '$env/static/public';

	if (browser) {
		try {
			initializeFirebase(JSON.parse(PUBLIC_FIREBASE_CLIENT_CONFIG));
		} catch (ex) {
			console.error(ex);
		}
	}
</script>

<div class="app">
	<Header />

	<main>
		<Auth />
		<slot />
	</main>

	<footer>
		<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
