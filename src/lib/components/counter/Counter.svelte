<script context="module" lang="ts">
	export const counterDataReady = writable(false);
	export async function getCounterData(fetch, session) {
		if (session.user) {
			const res = await fetch(`/data?collectionPath=counters&createIfNone=true`);
			if (res.ok) {
				const counterDataList = await res.json();
				counterDataReady.set(true);
				return counterDataList[0];
			}

			const { message } = await res.json();
			throw Error(message);
		} else {
			return null;
		}
	}
</script>

<script lang="ts">
	import { Count } from '$lib/models/Count';
	import { getDocumentStore, saveDocument } from '$lib/utils/firebase';
	import { spring } from 'svelte/motion';
	import { writable } from 'svelte/store';
	export let counterData: Partial<Count>;

	const count = getDocumentStore(Count, new Count(counterData));
	const displayed_count = spring();
	$: displayed_count.set($count.count);
	$: offset = modulo($displayed_count, 1);

	function modulo(n: number, m: number) {
		// handle negative numbers
		return ((n % m) + m) % m;
	}

	function decrement() {
		const doc = $count;
		doc.count -= 1;
		saveDocument(doc);
	}
	function increment() {
		const doc = $count;
		doc.count += 1;
		saveDocument(doc);
	}
</script>

<div class="counter">
	<button on:click={decrement} aria-label="Decrease the counter by one">
		<svg aria-hidden="true" viewBox="0 0 1 1">
			<path d="M0,0.5 L1,0.5" />
		</svg>
	</button>

	<div class="counter-viewport">
		<div class="counter-digits" style="transform: translate(0, {100 * offset}%)">
			<strong style="top: -100%" aria-hidden="true">{Math.floor($displayed_count + 1)}</strong>
			<strong>{Math.floor($displayed_count)}</strong>
		</div>
	</div>

	<button on:click={increment} aria-label="Increase the counter by one">
		<svg aria-hidden="true" viewBox="0 0 1 1">
			<path d="M0,0.5 L1,0.5 M0.5,0 L0.5,1" />
		</svg>
	</button>
</div>

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
		color: var(--text-color);
		font-size: 2rem;
	}

	.counter button:hover {
		background-color: var(--secondary-color);
	}

	svg {
		width: 25%;
		height: 25%;
	}

	path {
		vector-effect: non-scaling-stroke;
		stroke-width: 2px;
		stroke: var(--text-color);
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
		color: var(--accent-color);
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
