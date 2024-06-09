import { FIREBASE_SERVER_CONFIG } from '$env/static/private';
import admin from 'firebase-admin';
import type { Doc } from '$lib/models/doc';
import {
	PUBLIC_USE_FIREBASE_EMULATOR,
	PUBLIC_FIREBASE_EMULATOR_PROJECT,
	PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
	PUBLIC_FIRESTORE_EMULATOR_HOST,
	PUBLIC_FIRESTORE_EMULATOR_PORT,
	PUBLIC_FIREBASE_AUTH_EMULATOR_PORT
} from '$env/static/public';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { FieldPath, WhereFilterOp } from 'firebase-admin/firestore';
import { getDbObject } from '$lib/misc/functions';

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

export async function getUserDocuments<T extends Doc>(
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

export async function createUserDocument(collectionPath: string, uid: string): Promise<Doc> {
	initializeFirebase();
	const db = admin.firestore();
	const doc = await (await db.collection(collectionPath).add({ uid })).get();

	const document = <Doc>doc.data(); // Just need the data on the server
	document._id = doc.id;
	return document;
}

type WhereClause = {
	fieldPath: string | FieldPath;
	opStr: WhereFilterOp;
	value: any; // eslint-disable-line
};

export async function getDocuments<T extends Doc>(
	type: { new (): T },
	collectionPath: string,
	search: WhereClause | Array<WhereClause>
): Promise<Array<T>> {
	initializeFirebase();
	const db = admin.firestore();

	const wheres = Array.isArray(search) ? search : [search];
	const firstWhere = wheres[0];
	let query = db
		.collection(collectionPath)
		.where(firstWhere.fieldPath, firstWhere.opStr, firstWhere.value);
	for (const where of wheres.slice(1)) {
		query = query.where(where.fieldPath, where.opStr, where.value);
	}

	const querySnapshot = await query.get();
	const list: Array<T> = [];
	querySnapshot.forEach((doc) => {
		const document = new type();
		document._load(doc.data());
		document._id = doc.id;
		list.push(document);
	});
	return list;
}

export async function getDocument<T extends Doc>(
	type: { new (): T },
	collectionPath: string,
	id: string
): Promise<T | undefined> {
	initializeFirebase();
	const db = admin.firestore();

	const doc = await db.collection(collectionPath).doc(id).get();
	const data = doc.data();
	if (data) {
		const document = new type();
		document._load(data);
		document._id = doc.id;
		return document;
	}
}

export async function saveDocument<T extends Doc>(
	type: { new (): T },
	collectionPath: string,
	document: T
): Promise<T> {
	initializeFirebase();
	const db = admin.firestore();
	const dbObject = getDbObject(type, document);
	const collection = db.collection(collectionPath);
	if (document._id) {
		await collection.doc(document._id).set(dbObject);
	} else {
		const ref = await collection.add(dbObject);
		document._id = ref.id;
	}
	return document;
}
