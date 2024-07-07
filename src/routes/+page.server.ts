import { Count } from '$lib/models/count';
import { decodeToken, getDocuments, saveDocument } from '$lib/server/firebase.js';

type LoadResult = {
	userInfo?: { uid: string; email?: string };
	userCount?: Partial<Count>;
};

export async function load({ cookies, fetch }): Promise<LoadResult> {
	const token = cookies.get('token') || '';
	const decodedToken = await decodeToken(token);

	if (decodedToken) {
		const { uid, email } = decodedToken;

		const docs = await getDocuments(Count, 'counters', {
			fieldPath: 'uid',
			opStr: '==',
			value: uid
		});

		const userCount: Count = docs.length
			? docs[0]
			: await saveDocument('counters', new Count({ uid, count: 0 }));

		return { userInfo: { uid, email }, userCount: userCount._obj() };
	}
	return { userInfo: undefined, userCount: undefined };
}
