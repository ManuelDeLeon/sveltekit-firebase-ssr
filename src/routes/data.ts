import { createDocument, getDocuments, decodeToken } from '$lib/server/firebase';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';

export const get: RequestHandler = async (request) => {
	const cookies = cookie.parse(request.headers.cookie || '');
	const decodedToken = await decodeToken(cookies.token);
	const uid = decodedToken.uid;

	const collectionPath = request.query.get('collectionPath');
	const docs = await getDocuments(collectionPath, uid);
	docs.push(decodedToken);
	if (!docs.length && request.query.get('createIfNone')) {
		const doc = await createDocument(collectionPath, uid);
		docs.push(doc);
	}
	return {
		status: 200,
		body: JSON.stringify(docs)
	};
};
