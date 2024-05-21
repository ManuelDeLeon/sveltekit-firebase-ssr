import { FIREBASE_SERVER_CONFIG } from '$env/static/private';
import admin from 'firebase-admin';
import type { Document } from '$lib/models/document';
import {
	PUBLIC_USE_FIREBASE_EMULATOR,
	PUBLIC_FIREBASE_EMULATOR_PROJECT,
	PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
	PUBLIC_FIRESTORE_EMULATOR_HOST,
	PUBLIC_FIRESTORE_EMULATOR_PORT,
	PUBLIC_FIREBASE_AUTH_EMULATOR_PORT
} from '$env/static/public';
import type { DecodedIdToken } from 'firebase-admin/auth';

function initializeFirebase() {
	if (!admin.apps.length) {
		if (PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
			process.env.FIREBASE_AUTH_EMULATOR_HOST = `${PUBLIC_FIREBASE_AUTH_EMULATOR_HOST}:${PUBLIC_FIREBASE_AUTH_EMULATOR_PORT}`;
			process.env.GCLOUD_PROJECT = PUBLIC_FIREBASE_EMULATOR_PROJECT;
			process.env.FIRESTORE_EMULATOR_HOST = `${PUBLIC_FIRESTORE_EMULATOR_HOST}:${PUBLIC_FIRESTORE_EMULATOR_PORT}`;
			admin.initializeApp();
		} else {
			const serviceAccount = JSON.parse(FIREBASE_SERVER_CONFIG);
			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount),
				databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
			});
		}
	}
}

export async function decodeToken(token: string): Promise<DecodedIdToken | null> {
	if (!token || token === 'null' || token === 'undefined') return null;
	try {
		initializeFirebase();
		return await admin.auth().verifyIdToken(token);
	} catch (err) {
		console.error(err);
		return null;
	}
}

export async function getUserDocuments<T extends Document>(
	collectionPath: string,
	uid: string
): Promise<Array<T>> {
	initializeFirebase();
	const db = admin.firestore();
	const querySnapshot = await db.collection(collectionPath).where('uid', '==', uid).get();
	const list: Array<T> = [];
	querySnapshot.forEach((doc) => {
		const document: T = <T>doc.data(); // Just need the data on the server
		document._id = doc.id;
		list.push(document);
	});
	return list;
}

export async function createUserDocument<T extends Document>(
	collectionPath: string,
	uid: string
): Promise<Document> {
	initializeFirebase();
	const db = admin.firestore();
	const doc = await (await db.collection(collectionPath).add({ uid })).get();

	const document = <Document>doc.data(); // Just need the data on the server
	document._id = doc.id;
	return document;
}
