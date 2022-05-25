<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import { getCounterData } from '$lib/components/counter/Counter.svelte';
	export const load: Load = async function load({ session, fetch }) {
		return {
			props: {
				counterData: await getCounterData(fetch, session)
			}
		};
	};
</script>

<script lang="ts">
	import { session } from '$app/stores';
	import Counter from '$lib/components/counter/Counter.svelte';
	import type { Count } from '$lib/models/Count';
	export let counterData: Partial<Count>;
</script>

<section>
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
</style>
