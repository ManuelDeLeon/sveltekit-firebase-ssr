import type { FirebaseApp } from 'firebase/app';
import type { Firestore, QueryFieldFilterConstraint } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import {
	collection,
	getFirestore,
	query,
	addDoc,
	doc,
	onSnapshot,
	setDoc,
	deleteDoc,
	getDoc,
	connectFirestoreEmulator,
	getDocs
} from 'firebase/firestore';
import {
	getAuth,
	signInWithRedirect,
	signOut as _signOut,
	GoogleAuthProvider,
	onIdTokenChanged,
	connectAuthEmulator,
	signInWithEmailAndPassword as _signInWithEmailAndPassword
} from 'firebase/auth';
import type { Document } from '$lib/models/document';

import { browser } from '$app/environment';
import type { AnyObject } from '$lib/models/types';
import { invalidateAll } from '$app/navigation';

import {
	PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
	PUBLIC_FIREBASE_AUTH_EMULATOR_PORT,
	PUBLIC_FIREBASE_CLIENT_CONFIG,
	PUBLIC_FIREBASE_EMULATOR_PROJECT,
	PUBLIC_USE_FIREBASE_EMULATOR,
	PUBLIC_FIRESTORE_EMULATOR_HOST,
	PUBLIC_FIRESTORE_EMULATOR_PORT
} from '$env/static/public';
import { useUser } from './state.svelte';

const user = useUser();

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
	const auth = getAuth();

	onIdTokenChanged(
		auth,
		async (newUser) => {
			if (newUser) {
				const token = await newUser.getIdToken();
				await setToken(token);
				user.value = { email: newUser.email, uid: newUser.uid };
			} else {
				await setToken('');
				user.value = null;
			}
			await invalidateAll();
		},
		(err) => console.error(err.message)
	);
}

export let app: FirebaseApp;
export let db: Firestore;
export function initializeFirebase() {
	if (!browser) {
		throw new Error("Can't use the Firebase client on the server.");
	}
	if (!app) {
		if (PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
			app = initializeApp({
				projectId: PUBLIC_FIREBASE_EMULATOR_PROJECT,
				apiKey: 'dummy-key',
				authDomain: PUBLIC_FIREBASE_AUTH_EMULATOR_HOST
			});
			connectAuthEmulator(
				getAuth(),
				`http://${PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}:${PUBLIC_FIREBASE_AUTH_EMULATOR_PORT}`,
				{
					disableWarnings: true
				}
			);

			db = getFirestore();
			connectFirestoreEmulator(
				db,
				PUBLIC_FIRESTORE_EMULATOR_HOST,
				parseInt(PUBLIC_FIRESTORE_EMULATOR_PORT)
			);
		} else {
			app = initializeApp(JSON.parse(PUBLIC_FIREBASE_CLIENT_CONFIG));
			db = getFirestore(app);
			listenForAuthChanges();
		}

		listenForAuthChanges();
	}
}

export async function signInWithGoogle() {
	const auth = getAuth();
	await signInWithRedirect(auth, new GoogleAuthProvider());
}

export async function signInWithEmailAndPassword(email: string, password: string) {
	const auth = getAuth();
	await _signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
	const auth = getAuth();
	await _signOut(auth);
}

function getDbObject<T extends Document>(document: T): Partial<Document> {
	const obj: AnyObject = {};
	Object.keys(document)
		.filter((k) => document._dbFields.includes(k))
		.forEach((k) => {
			obj[k] = document[k as keyof Document];
		});
	return obj;
}

export async function saveDocument<T extends Document>(path: string, document: T) {
	const dbObject = getDbObject(document);

	if (document._id) {
		await setDoc(doc(db, path, document._id), dbObject);
	} else {
		const todoRef = await addDoc(collection(db, path), dbObject);
		document._id = todoRef.id;
	}
}

export async function getDocument<T extends Document>(
	type: { new (data: AnyObject): T },
	path: string,
	id: string
): Promise<T | null> {
	const docSnap = await getDoc(doc(db, path, id));
	if (docSnap.exists()) {
		const ret = new type(docSnap.data());
		ret._id = docSnap.id;
		return ret;
	} else {
		return null;
	}
}

export async function getDocuments<T extends Document>(
	type: { new (data: AnyObject): T },
	path: string,
	search: QueryFieldFilterConstraint | Array<QueryFieldFilterConstraint>
): Promise<Array<T>> {
	const wheres = Array.isArray(search) ? search : [search];
	const q = query(collection(db, path), ...wheres);
	const docSnap = await getDocs(q);
	return docSnap.docs.map((d) => {
		const ret = new type(d.data());
		ret._id = d.id;
		return ret;
	});
}

export async function deleteDocument(path: string, id: string) {
	await deleteDoc(doc(db, path, id));
}

export function useDocument<T extends Document>(
	type: { new (data: AnyObject): T },
	path: string,
	id: string,
	defaultValue: T | undefined = undefined,
	onDeleted: () => void = () => undefined
) {
	let obj: T | undefined = $state(defaultValue);
	$effect(() => {
		const dbUnsubscribe = onSnapshot(doc(db, path, id), (docSnap) => {
			if (docSnap.exists()) {
				const newDoc = new type(docSnap.data());
				newDoc._id = docSnap.id;
				obj = newDoc;
			} else {
				obj = undefined;
				onDeleted();
				dbUnsubscribe();
			}
		});
		return () => {
			dbUnsubscribe();
		};
	});

	return {
		get value() {
			return obj;
		}
	};
}

export function useDocuments<T extends Document>(
	type: { new (data: AnyObject): T },
	path: string,
	search: QueryFieldFilterConstraint | Array<QueryFieldFilterConstraint>,
	initialData: Array<T> = []
) {
	let arr: Array<T> = $state(initialData);
	$effect(() => {
		const wheres = Array.isArray(search) ? search : [search];
		const q = query(collection(db, path), ...wheres);
		const dbUnsubscribe = onSnapshot(q, (docs) => {
			const newDocuments: Array<T> = [];
			docs.forEach((docSnap) => {
				const newDoc = new type(docSnap.data());
				newDoc._id = docSnap.id;
				newDocuments.push(newDoc);
			});
			arr = newDocuments;
		});
		return () => {
			dbUnsubscribe();
		};
	});

	return {
		get value() {
			return arr;
		}
	};
}
