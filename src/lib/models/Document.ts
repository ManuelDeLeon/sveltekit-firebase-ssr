export class Document {
	constructor(data: Object = null) {
		this._load(data);
	}

	_load(data: Object) {
		if (data) {
			Object.assign(this, data);
		}
	}

	_collection = '';
	_dbFields = ['uid'];
	_id = '';
	uid = '';
}
