import { initializeApp } from 'firebase/app';
import {
	collection,
	getDocs,
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
import cookie from 'cookie';
import { browser } from '$app/env';
import { readable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { Document } from '$lib/models/Document';

export let app;
export let db;
export function initializeFirebase(options: any) {
	if (!app) {
		app = initializeApp(options);
		db = getFirestore(app);
		listenForAuthChanges();
	}
}

function listenForAuthChanges() {
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

export async function getDocuments<T extends Document>(
	type: { new (data: Object): T },
	collectionPath: string,
	uid: string
): Promise<Array<T>> {
	if (!uid) return [];

	const db = getFirestore(app);
	const q = query(collection(db, collectionPath), where('uid', '==', uid));
	const querySnapshot = await getDocs(q);

	let list: Array<T> = [];
	querySnapshot.forEach((doc) => {
		const document = new type(doc.data());
		document._id = doc.id;
		list.push(document);
	});
	return list;
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

export async function deleteDocument(document: Document) {
	if (!document._collection) throw Error('Objects that extends Document must specify __collection');

	await deleteDoc(doc(db, document._collection, document._id));
}

function getDbObject(document: Document): Partial<Document> {
	const obj = {};
	Object.keys(document)
		.filter((k) => document._dbFields.includes(k))
		.forEach((k) => {
			obj[k] = document[k];
		});
	return obj;
}

export function getDocumentStore<T extends Document>(
	type: { new (data: Object): T },
	document: T
): Readable<T> {
	return readable<T>(null, (set) => {
		set(document);

		let dbUnsubscribe: () => void;
		let unsubbed = false;
		let unsub = () => {
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

export function getCollectionStore<T extends Document>(
	type: { new (data: Object): T },
	collectionPath: string,
	uid: string,
	initialData: Array<T> = []
) {
	return readable(null, (set) => {
		set(initialData);

		let dbUnsubscribe: () => void;
		let unsubbed = false;
		let unsub = () => {
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
					const newDocuments = [];
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
