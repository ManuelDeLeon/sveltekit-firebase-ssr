import { browser } from '$app/env';

if (browser) {
	// Just in case. I want to know if this file spills into the client ASAP.
	throw Error('Cannot load server constants on the client');
}

export const FIREBASE_PRIVATE_KEY = import.meta.env.VITE_FIREBASE_PRIVATE_KEY.toString();
export const FIREBASE_CLIENT_EMAIL = import.meta.env.VITE_FIREBASE_CLIENT_EMAIL.toString();
export const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID.toString();
