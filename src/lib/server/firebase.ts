import { FIREBASE_SERVER_CONFIG } from './constants';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import admin from 'firebase-admin';

function initializeFirebase() {
	if (!admin.apps.length) {
		const serviceAccount = JSON.parse(FIREBASE_SERVER_CONFIG);
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
		});
	}
}

export async function decodeToken(token: string): Promise<DecodedIdToken | null> {
	if (!token) return null;
	try {
		initializeFirebase();
		return await admin.auth().verifyIdToken(token);
	} catch (err) {
		console.log('decodeToken error', err);
		return null;
	}
}

export async function getDocuments<T>(collectionPath: string, uid: string): Promise<Array<T>> {
	if (!uid) return [];
	initializeFirebase();
	const db = admin.firestore();
	const querySnapshot = await db.collection(collectionPath).where('uid', '==', uid).get();
	let list = [];
	querySnapshot.forEach((doc) => {
		const document = doc.data();
		document.id = doc.id;
		list.push(document);
	});
	return list;
}

export async function createDocument<T>(collectionPath: string, uid: string): Promise<T> {
	if (!uid) return null;
	initializeFirebase();
	const db = admin.firestore();
	const doc = await (await db.collection(collectionPath).add({ uid })).get();

	let document = null;
	document = doc.data();
	document.id = doc.id;
	return document;
}
