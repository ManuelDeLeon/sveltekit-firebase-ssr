<script context="module" lang="ts">
	// Can't use native fetch because this will be called by the server during SSR
	export async function getUserCountData(fetch: Fetch): Promise<Count> {
		const res = await fetch(`/api/data?collectionPath=counters&createIfNone=true`);
		if (res.ok) {
			const userCountDataArray = await res.json();
			return userCountDataArray[0];
		}

		const { message } = await res.json();
		throw Error(message);
	}
</script>

<script lang="ts">
	import { saveDocument, useDocument } from '$lib/client/firebase.svelte';
	import { useUser } from '$lib/client/state.svelte';
	import { Count } from '$lib/models/Count';
	import type { Fetch } from '$lib/models/types';

	// Components can get data from a shared variable
	// This one is set on +page.svelte
	const user = useUser();

	// Components can also get data from a prop passed by the parent
	let {
		userCount
	}: {
		userCount: Count;
	} = $props();

	// Get a reactive/rune variable initialized to the prop passed by the parent
	// This one is set on +page.svelte
	let countDoc = useDocument(Count, 'counters', userCount._id, userCount);

	function decrement() {
		if (!countDoc.value) return;
		countDoc.value.count -= 1;
		saveDocument('counters', countDoc.value);
	}
	function increment() {
		if (!countDoc.value) return;
		countDoc.value.count += 1;
		saveDocument('counters', countDoc.value);
	}
</script>

<div class="counter">
	<button onclick={decrement} aria-label="Decrease the counter by one">
		<svg aria-hidden="true" viewBox="0 0 1 1">
			<path d="M0,0.5 L1,0.5" />
		</svg>
	</button>

	<div class="counter-viewport">
		<div class="counter-digits">
			<strong>{Math.floor(countDoc.value?.count || 0)}</strong>
		</div>
	</div>

	<button onclick={increment} aria-label="Increase the counter by one">
		<svg aria-hidden="true" viewBox="0 0 1 1">
			<path d="M0,0.5 L1,0.5 M0.5,0 L0.5,1" />
		</svg>
	</button>
</div>

{#if user.value}
	<div style="display: flex; flex-direction: column; gap: 0.5rem">
		<div>
			User data on Counter.svelte: ({user.value.email})
		</div>
	</div>
{/if}

<style>
	.counter {
		display: flex;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		margin: 1rem 0;
	}

	.counter button {
		width: 2em;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		background-color: transparent;
		touch-action: manipulation;
		font-size: 2rem;
	}

	.counter button:hover {
		background-color: var(--color-bg-1);
	}

	svg {
		width: 25%;
		height: 25%;
	}

	path {
		vector-effect: non-scaling-stroke;
		stroke-width: 2px;
		stroke: #444;
	}

	.counter-viewport {
		width: 8em;
		height: 4em;
		overflow: hidden;
		text-align: center;
		position: relative;
	}

	.counter-viewport strong {
		position: absolute;
		display: flex;
		width: 100%;
		height: 100%;
		font-weight: 400;
		color: var(--color-theme-1);
		font-size: 4rem;
		align-items: center;
		justify-content: center;
	}

	.counter-digits {
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
