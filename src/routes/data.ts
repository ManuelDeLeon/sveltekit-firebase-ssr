import { createDocument, getDocuments } from '$lib/server/firebaseAdmin';
import { decodeToken } from '$lib/server/firebaseAdmin';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';

export const get: RequestHandler = async (request) => {
	const cookies = cookie.parse(request.headers.cookie || '');
	const decodedToken = await decodeToken(cookies.token);
	const uid = decodedToken.uid;

	const collectionPath = request.query.get('collectionPath');
	const docs = await getDocuments(collectionPath, uid);

	if (!docs.length && request.query.get('createIfNone')) {
		docs.push(await createDocument(collectionPath, uid));
	}

	return {
		status: 200,
		body: JSON.stringify(docs)
	};
};
