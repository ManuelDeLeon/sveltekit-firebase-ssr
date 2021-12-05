import { browser } from '$app/env';

if (browser) {
	// Just in case. I want to know if this file spills into the client ASAP.
	throw Error('Cannot load server constants on the client');
}

export let FIREBASE_PRIVATE_KEY = '';
export let FIREBASE_CLIENT_EMAIL = '';
export let FIREBASE_PROJECT_ID = '';

if (process && process.env.VITE_FIREBASE_PRIVATE_KEY) {
	FIREBASE_PRIVATE_KEY = process.env.VITE_FIREBASE_PRIVATE_KEY;
	FIREBASE_CLIENT_EMAIL = process.env.VITE_FIREBASE_CLIENT_EMAIL;
	FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
} else {
	FIREBASE_PRIVATE_KEY = import.meta.env.VITE_FIREBASE_PRIVATE_KEY.toString();
	FIREBASE_CLIENT_EMAIL = import.meta.env.VITE_FIREBASE_CLIENT_EMAIL.toString();
	FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID.toString();
}
