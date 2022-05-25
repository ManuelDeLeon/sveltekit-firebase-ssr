import type { AnyObject } from 'AppModule';

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
