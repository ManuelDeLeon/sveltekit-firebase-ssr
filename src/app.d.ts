/// <reference types="@sveltejs/kit" />

declare let { FirebaseOptions }: import('firebase').app;

interface UserSession {
	name: string | null;
	email: string | null;
	uid: string;
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	interface Locals {
		userid: string;
		decodedToken: DecodedIdToken | null;
	}

	// interface Platform {}

	interface Session {
		user: UserSession | undefined;
		firebaseClientConfig: FirebaseOptions;
	}

	// interface Stuff {}
}

declare module 'AppModule' {
	type Fetch = (info: RequestInfo, init?: RequestInit) => Promise<Response>;
	type AnyObject = Record<string, unknown>;
	type Session = App.Session;
}
