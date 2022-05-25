import * as cookie from 'cookie';
import { protectedPages } from '$lib/client/constants';
import { decodeToken } from '$lib/server/firebase';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { FIREBASE_CLIENT_CONFIG } from '$lib/server/constants';
import type { GetSession, Handle } from '@sveltejs/kit';

export const getSession: GetSession = async (event) => {
	const locals = event.locals;
	const decodedToken: DecodedIdToken | null = locals.decodedToken;
	if (decodedToken) {
		const { uid, name, email } = decodedToken;
		return {
			user: { name: name || null, email: email || null, uid },
			firebaseClientConfig: FIREBASE_CLIENT_CONFIG
		};
	} else {
		return { user: undefined, firebaseClientConfig: FIREBASE_CLIENT_CONFIG };
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	event.locals.decodedToken = await decodeToken(cookies.token);
	const response = await resolve(event);

	if (!event.locals.decodedToken && protectedPages.has(event.url.pathname)) {
		// Trying to access a protected page directly, send them to the 403
		response.headers.set('Location', '/403');
		response.headers.set('status', '302');
	}

	return response;
};
