<script lang="ts">
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
	import {
		signInWithEmailAndPassword,
		signInWithGoogle,
		signOut
	} from '$lib/client/firebase.svelte';
	import { useUser } from '$lib/client/state.svelte';
	import { PUBLIC_USE_FIREBASE_EMULATOR } from '$env/static/public';

	// Get the user info and count data from the server (+page.server.ts)
	let { data } = $props();
	const dataUser = data.userInfo
		? { uid: data.userInfo.uid, email: data.userInfo.email || null }
		: null;

	// Set the value of the shared user variable
	// Counter.svelte will pick up this shared value
	const user = useUser(dataUser);

	let email = $state('');
	let password = $state('');

	async function signInEmailAndPassword() {
		await signInWithEmailAndPassword(email, password);
	}
	async function signInGoogle() {
		await signInWithGoogle();
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcome_fallback} alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app
	</h1>

	{#if user.value && data.userCount}
		<div style="display: flex; flex-direction: column; gap: 0.5rem">
			<div>
				User data on +page.svelte: ({user.value.email})
			</div>

			<button onclick={() => signOut()}>Sign Out</button>
		</div>

		<Counter userCount={data.userCount} />
	{:else}
		<div style="display: flex; flex-direction: column; gap: 0.5rem">
			{#if PUBLIC_USE_FIREBASE_EMULATOR === 'true'}
				<input
					class="border border-slate-800 rounded-lg px-3 py-1"
					type="email"
					placeholder="Email..."
					bind:value={email}
				/>
				<input
					class="border border-slate-800 rounded-lg px-3 py-1"
					type="password"
					placeholder="Password..."
					bind:value={password}
				/>
				<button class="button-main" onclick={signInEmailAndPassword}
					>Sign In with Email/Password</button
				>
			{/if}
			<hr />
			<button class="button-main" onclick={signInGoogle}>Sign In with Google</button>
		</div>
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
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
