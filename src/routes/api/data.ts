import { createDocument, getDocuments, decodeToken } from '$lib/server/firebase';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';

export const get: RequestHandler = async (event) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	const decodedToken = await decodeToken(cookies.token);
	if (!decodedToken) {
		return {
			status: 401
		};
	}
	const uid = decodedToken.uid;

	const collectionPath = event.url.searchParams.get('collectionPath');
	if (!collectionPath) {
		return {
			status: 400
		};
	}

	const docs = await getDocuments(collectionPath, uid);
	if (!docs.length && event.url.searchParams.get('createIfNone')) {
		const doc = await createDocument(collectionPath, uid);
		docs.push(doc);
	}
	return {
		status: 200,
		body: JSON.stringify(docs)
	};
};
