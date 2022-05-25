import { FIREBASE_SERVER_CONFIG } from './constants';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import admin from 'firebase-admin';
import type { Document } from '$lib/models/Document';

function initializeFirebase() {
	if (!admin.apps.length) {
		const serviceAccount = FIREBASE_SERVER_CONFIG;
		admin.initializeApp({
			credential: admin.credential.cert(serviceAccount),
			databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
		});
	}
}

export async function decodeToken(token: string): Promise<DecodedIdToken | null> {
	if (!token || token === 'null' || token === 'undefined') return null;
	try {
		initializeFirebase();
		return await admin.auth().verifyIdToken(token);
	} catch (err) {
		return null;
	}
}

export async function getDocuments(collectionPath: string, uid: string): Promise<Array<Document>> {
	if (!uid) return [];
	initializeFirebase();
	const db = admin.firestore();
	const querySnapshot = await db.collection(collectionPath).where('uid', '==', uid).get();
	const list: Array<Document> = [];
	querySnapshot.forEach((doc) => {
		const document: Document = <Document>doc.data(); // Just need the data on the server
		document._id = doc.id;
		list.push(document);
	});
	return list;
}

export async function createDocument(collectionPath: string, uid: string): Promise<Document> {
	initializeFirebase();
	const db = admin.firestore();
	const doc = await (await db.collection(collectionPath).add({ uid })).get();

	const document = <Document>doc.data(); // Just need the data on the server
	document._id = doc.id;
	return document;
}
