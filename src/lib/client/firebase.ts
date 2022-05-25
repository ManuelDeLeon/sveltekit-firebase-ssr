import type { FirebaseApp, FirebaseOptions } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import {
	collection,
	getFirestore,
	query,
	where,
	addDoc,
	doc,
	onSnapshot,
	setDoc,
	deleteDoc
} from 'firebase/firestore';
import {
	getAuth,
	signInWithRedirect,
	signOut as _signOut,
	GoogleAuthProvider,
	onIdTokenChanged
} from 'firebase/auth';
import { session } from '$app/stores';
import type { Document } from '$lib/models/Document';
import { readable } from 'svelte/store';
import { browser } from '$app/env';
import type { AnyObject } from 'AppModule';

async function setToken(token: string) {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		body: JSON.stringify({ token })
	};

	await fetch('/api/token', options);
}

function listenForAuthChanges() {
	const auth = getAuth(app);

	onIdTokenChanged(
		auth,
		async (user) => {
			if (user) {
				const token = await user.getIdToken();
				await setToken(token);
				session.update((oldSession) => {
					oldSession.user = {
						name: user.displayName,
						email: user.email,
						uid: user.uid
					};
					return oldSession;
				});
			} else {
				await setToken('');
				session.update((oldSession) => {
					oldSession.user = undefined;
					return oldSession;
				});
			}
		},
		(err) => console.error(err.message)
	);
}

export let app: FirebaseApp;
export let db: Firestore;
export function initializeFirebase(options: FirebaseOptions) {
	if (!app) {
		app = initializeApp(options);
		db = getFirestore(app);
		listenForAuthChanges();
	}
}

function getDbObject(document: Document): Partial<Document> {
	const obj: AnyObject = {};
	Object.keys(document)
		.filter((k) => document._dbFields.includes(k))
		.forEach((k) => {
			obj[k] = document[k as keyof Document];
		});
	return obj;
}

export async function saveDocument(document: Document) {
	const dbObject = getDbObject(document);
	if (!document._collection) throw Error('Objects that extends Document must specify __collection');

	if (document._id) {
		await setDoc(doc(db, document._collection, document._id), dbObject);
	} else {
		const todoRef = await addDoc(collection(db, document._collection), dbObject);
		document._id = todoRef.id;
	}
}

export function getDocumentStore<T extends Document>(
	type: { new (data: AnyObject): T },
	document: T
) {
	return readable<T | undefined>(document, (set) => {
		let dbUnsubscribe: () => void;
		let unsubbed = false;
		const unsub = () => {
			unsubbed = true;
			if (dbUnsubscribe) {
				dbUnsubscribe();
			}
		};
		if (browser) {
			(async () => {
				if (unsubbed) return;
				dbUnsubscribe = onSnapshot(doc(db, document._collection, document._id), (doc) => {
					if (doc.exists()) {
						const newDoc = new type(doc.data());
						newDoc._id = doc.id;
						set(newDoc);
					} else {
						set(undefined);
						dbUnsubscribe();
					}
				});
			})();
		}

		return unsub;
	});
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

export async function deleteDocument(document: Document) {
	if (!document._collection) throw Error('Objects that extends Document must specify __collection');

	await deleteDoc(doc(db, document._collection, document._id));
}

export function getCollectionStore<T extends Document>(
	type: { new (data: AnyObject): T },
	collectionPath: string,
	uid: string,
	initialData: Array<T> = []
) {
	return readable<Array<T>>(initialData, (set) => {
		let dbUnsubscribe: () => void;
		let unsubbed = false;
		const unsub = () => {
			unsubbed = true;
			if (dbUnsubscribe) {
				dbUnsubscribe();
			}
		};
		if (browser) {
			(async () => {
				if (unsubbed) return;
				const q = query(collection(db, collectionPath), where('uid', '==', uid));
				dbUnsubscribe = onSnapshot(q, (docs) => {
					const newDocuments: Array<T> = [];
					docs.forEach((doc) => {
						const newDoc = new type(doc.data());
						newDoc._id = doc.id;
						newDocuments.push(newDoc);
					});
					set(newDocuments);
				});
			})();
		}

		return unsub;
	});
}
