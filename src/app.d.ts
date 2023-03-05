declare const { UserSession }: import('$lib/models/types');

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			userSession: UserSession | undefined;
		}
		interface PageData {
			userSession: UserSession;
		}
	}
}

export {};
