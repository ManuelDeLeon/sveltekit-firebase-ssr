import type { PageLoad } from './$types';
import { getUserCountData } from './Counter.svelte';
export const load: PageLoad = async function load({ fetch, parent }) {
	const parentData = await parent();
	let userCountData = parentData.userSession ? await getUserCountData(fetch) : undefined;

	return {
		userCountData
	};
};
