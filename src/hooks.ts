import cookie from 'cookie';
import type { Handle, Request } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { decodeToken } from '$lib/server/firebase';
import { publicPages } from '$lib/utils/constants';
import { FIREBASE_CLIENT_CONFIG } from '$lib/server/constants';

export async function getSession(request: Request) {
	const decodedToken: DecodedIdToken | null = request.locals.decodedToken;
	let firebaseClientConfig = JSON.parse(FIREBASE_CLIENT_CONFIG);

	if (decodedToken) {
		const { uid, name, email } = decodedToken;

		return { user: { name, email, uid }, firebaseClientConfig };
	} else {
		return { user: null, firebaseClientConfig };
	}
}

export const handle: Handle = async ({ request, resolve }) => {
	const cookies = cookie.parse(request.headers.cookie || '');
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

	return response;
};
