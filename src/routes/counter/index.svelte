<script context="module" lang="ts">
	export async function load({ fetch, session }: LoadInput) {
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
	import type { LoadInput } from '@sveltejs/kit';
	export let counterData: Partial<Count>;
	let thisSession: any;
	$: thisSession = $session;
</script>

<section>
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
</style>
