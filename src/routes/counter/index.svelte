<script context="module" lang="ts">
	export async function load({ page, fetch, session, stuff }) {
		if (session.user) {
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
		} else {
			return {};
		}
	}
</script>

<script lang="ts">
	import Counter from '$lib/components/counter/Counter.svelte';
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
