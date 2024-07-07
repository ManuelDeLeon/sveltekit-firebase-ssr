import type { Doc } from '$lib/models/doc';
import type { AnyObject } from '$lib/models/types';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { FieldPath, WhereFilterOp } from 'firebase-admin/firestore';

import { FIREBASE_SERVER_CONFIG } from '$env/static/private';
import {
	PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
	PUBLIC_FIREBASE_AUTH_EMULATOR_PORT,
	PUBLIC_FIREBASE_EMULATOR_PROJECT,
	PUBLIC_FIRESTORE_EMULATOR_HOST,
	PUBLIC_FIRESTORE_EMULATOR_PORT,
	PUBLIC_USE_EMULATOR
} from '$env/static/public';
import admin from 'firebase-admin';

function initializeFirebase() {
	if (!admin.apps.length) {
		if (PUBLIC_USE_EMULATOR === 'true') {
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

export async function createUserDocument(collectionPath: string, uid: string): Promise<Doc> {
	initializeFirebase();
	const db = admin.firestore();
	const doc = await (await db.collection(collectionPath).add({ uid })).get();

	const document = doc.data() as Doc;
	document._id = doc.id;
	return document;
}

export type WhereClause = {
	fieldPath: FieldPath | string;
	opStr: WhereFilterOp;
	value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};
export async function getDocuments<T extends Doc>(
	type: { new (data: AnyObject): T },
	collectionPath: string,
	search: Array<WhereClause> | WhereClause
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
		const document = new type(doc.data());
		document._id = doc.id;
		list.push(document);
	});
	return list;
}

export async function getDocument<T extends Doc>(
	type: { new (data: AnyObject): T },
	collectionPath: string,
	id: string
): Promise<T | undefined> {
	initializeFirebase();
	const db = admin.firestore();

	const doc = await db.collection(collectionPath).doc(id).get();
	const data = doc.data();
	if (data) {
		const document = new type(data);
		document._id = doc.id;
		return document;
	}
}

export async function saveDocument<T extends Doc>(
	collectionPath: string,
	docToSave: T
): Promise<T> {
	initializeFirebase();
	const db = admin.firestore();
	const collection = db.collection(collectionPath);
	if (docToSave._id) {
		await collection.doc(docToSave._id).set(docToSave._obj());
	} else {
		const ref = await collection.add(docToSave._obj());
		docToSave._id = ref.id;
	}
	return docToSave;
}
