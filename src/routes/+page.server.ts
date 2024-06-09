import type { Count } from '$lib/models/count';
import { decodeToken } from '$lib/server/firebase.js';
import { getUserCountData } from './Counter.svelte';

type LoadResult = {
	userInfo?: { uid: string; email?: string };
	userCount?: Count;
};

export async function load({ cookies, fetch }): Promise<LoadResult> {
	const token = cookies.get('token') || '';
	const decodedToken = await decodeToken(token);
	if (decodedToken) {
		const { uid, email } = decodedToken;
		const userCount = await getUserCountData(fetch);

		return { userInfo: { uid, email }, userCount };
	}

	return { userInfo: undefined, userCount: undefined };
}
