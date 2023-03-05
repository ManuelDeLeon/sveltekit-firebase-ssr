import type { PageLoad } from './$types';
import { getCounterData } from './Counter.svelte';
export const load: PageLoad = async function load({ fetch, parent }) {
	const parentData = await parent();
	return {
		counterData: await getCounterData(fetch, parentData.userSession)
	};
};
