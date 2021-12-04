<script context="module" lang="ts">
	export const prerender = true;
	export async function load({ page, fetch, session, stuff }) {
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
	}
</script>

<script lang="ts">
	import Counter from '$lib/components/Counter/Counter.svelte';
	export let counterData: Array<any> = [];
</script>

<section>
	<Counter {counterData} />
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
