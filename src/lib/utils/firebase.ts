import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import {
	getAuth,
	signInWithRedirect,
	signOut as _signOut,
	GoogleAuthProvider,
	onIdTokenChanged
} from 'firebase/auth';
import { session } from '$app/stores';
import cookie from 'cookie';

export let app;
export let db;
export function initializeFirebase(options: any) {
	if (!app) {
		app = initializeApp(options);
		db = getFirestore(app);
	}
}

let listening = false;
export async function listenForAuthChanges() {
	if (listening) return;
	listening = true;

	const auth = getAuth(app);

	onIdTokenChanged(
		auth,
		async (user) => {
			let token = null;
			if (user) {
				token = await user.getIdToken();
				session.update((oldSession) => {
					oldSession.user = {
						name: user.displayName,
						email: user.email,
						uid: user.uid
					};
					return oldSession;
				});
			} else {
				session.set({});
			}
			document.cookie = cookie.serialize('token', token, { path: '/' });
		},
		(err) => console.error(err.message)
	);
}

function providerFor(name: string) {
	switch (name) {
		case 'google':
			return new GoogleAuthProvider();
		default:
			throw 'unknown provider ' + name;
	}
}
export async function signInWith(name: string) {
	const auth = getAuth(app);
	const provider = providerFor(name);
	await signInWithRedirect(auth, provider);
}

export async function signOut() {
	const auth = getAuth(app);
	await _signOut(auth);
}

export async function getDocuments<T>(collectionPath: string, uid: string): Promise<Array<T>> {
	if (!uid) return [];

	const db = getFirestore(app);
	const q = query(collection(db, collectionPath), where('uid', '==', uid));
	const querySnapshot = await getDocs(q);

	let list = [];
	querySnapshot.forEach((doc) => {
		const document = doc.data();
		document.id = doc.id;
		list.push(document);
	});
	return list;
}
