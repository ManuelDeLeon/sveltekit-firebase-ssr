import { createDocument, getDocuments, decodeToken } from '$lib/server/firebase';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const decodedToken = await decodeToken(cookies.get('token') || '');
	if (!decodedToken) {
		throw error(401, 'Not logged in');
	}
	const uid = decodedToken.uid;

	const collectionPath = url.searchParams.get('collectionPath');
	if (!collectionPath) {
		throw error(400, 'Missing param collectionPath');
	}

	const docs = await getDocuments(collectionPath, uid);
	if (!docs.length && url.searchParams.get('createIfNone')) {
		const doc = await createDocument(collectionPath, uid);
		docs.push(doc);
	}
	return new Response(JSON.stringify(docs));
};
