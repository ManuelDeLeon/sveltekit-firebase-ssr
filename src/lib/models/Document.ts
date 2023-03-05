import type { AnyObject } from '$lib/models/types';

export class Document {
	constructor(data: AnyObject = {}) {
		this._load(data);
	}

	_load(data: AnyObject) {
		if (data) {
			Object.assign(this, data);
		}
	}

	_collection = '';
	_dbFields = ['uid'];
	_id = '';
	uid = '';
}
