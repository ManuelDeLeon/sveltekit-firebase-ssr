import { browser } from '$app/env';
import { db } from '$lib/utils/firebase';
import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { readable } from 'svelte/store';

export class Document {
	constructor(data: Object = null) {
		this._load(data);
	}

	protected _load(data: Object) {
		if (data) {
			Object.assign(this, data);
		}
	}

	_collection = '';
	_dbFields = ['uid'];
	id = '';
	uid = '';

	async save() {
		const dbObject = this._getDbObject();
		if (!this._collection) throw Error('Objects that extends Document must specify __collection');

		if (this.id) {
			await setDoc(doc(db, this._collection, this.id), dbObject);
		} else {
			const todoRef = await addDoc(collection(db, this._collection), dbObject);
			this.id = todoRef.id;
		}
	}

	async delete() {
		const dbObject = this._getDbObject();
		if (!this._collection) throw Error('Objects that extends Document must specify __collection');

		await deleteDoc(doc(db, this._collection, this.id));
	}

	private _getDbObject(): Partial<Document> {
		const obj = {};
		Object.keys(this)
			.filter((k) => this._dbFields.includes(k))
			.forEach((k) => {
				obj[k] = this[k];
			});
		return obj;
	}

	getStore() {
		return readable(null, (set) => {
			set(this);

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
					if (!this.id) await this.save();
					if (unsubbed) return;
					dbUnsubscribe = onSnapshot(doc(db, this._collection, this.id), (doc) => {
						if (doc.exists()) {
							this._load(doc.data());
							set(this);
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
}
