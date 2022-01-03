import { createDocument, getDocuments, decodeToken } from '$lib/server/firebase';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';

export const get: RequestHandler = async (request) => {
	const cookies = cookie.parse(request.headers.cookie || '');
	const decodedToken = await decodeToken(cookies.token);
	if (!decodedToken) {
		return {
			status: 401
		};
	}
	const uid = decodedToken.uid;

	const collectionPath = request.url.searchParams.get('collectionPath');
	if (!collectionPath) {
		return {
			status: 400
		};
	}

	const docs = await getDocuments(collectionPath, uid);
	if (!docs.length && request.url.searchParams.get('createIfNone')) {
		const doc = await createDocument(collectionPath, uid);
		docs.push(doc);
	}
	return {
		status: 200,
		body: JSON.stringify(docs)
	};
};
