<script context="module" lang="ts">
	export async function load({ page, fetch, session, stuff }) {
		return {
			props: {
				counterData: await getCounterData(fetch, session)
			}
		};
	}
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import Counter, {
		getCounterData,
		counterDataReady
	} from '$lib/components/counter/Counter.svelte';
	import type { Count } from '$lib/models/Count';
	export let counterData: Partial<Count>;
</script>

<section>
	{#if $session.user && $counterDataReady}
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
