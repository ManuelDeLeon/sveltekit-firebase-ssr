import cookie from 'cookie';
import { v4 as uuid } from '@lukeed/uuid';
import type { Handle, Request } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { decodeToken } from '$lib/server/firebase';
import { publicPages } from '$lib/utils/constants';
import { FIREBASE_CONFIG } from '$lib/server/constants';

export async function getSession(request: Request) {
	const decodedToken: DecodedIdToken | null = request.locals.decodedToken;
	let firebase;
	try {
		firebase = JSON.parse(FIREBASE_CONFIG);
	} catch {
		throw Error('Failed to load Firebase Config from: ' + FIREBASE_CONFIG);
	}
	if (decodedToken) {
		const { uid, name, email } = decodedToken;

		return { user: { name, email, uid }, firebase };
	} else {
		return { user: null, firebase };
	}
}

export const handle: Handle = async ({ request, resolve }) => {
	const cookies = cookie.parse(request.headers.cookie || '');
	request.locals.userid = cookies.userid || uuid();
	request.locals.decodedToken = await decodeToken(cookies.token);
	if (!request.locals.decodedToken && !publicPages.includes(request.path)) {
		// If you are not logged in and you are not on a public page,
		// it just redirects you to the main page, which is / in this case.
		return {
			headers: { Location: '/' },
			status: 302
		};
	}

	// TODO https://github.com/sveltejs/kit/issues/1046
	if (request.query.has('_method')) {
		request.method = request.query.get('_method').toUpperCase();
	}

	const response = await resolve(request);

	if (!cookies.userid) {
		// if this is the first time the user has visited this app,
		// set a cookie so that we recognise them when they return
		response.headers['set-cookie'] = cookie.serialize('userid', request.locals.userid, {
			path: '/',
			httpOnly: true
		});
	}

	return response;
};
