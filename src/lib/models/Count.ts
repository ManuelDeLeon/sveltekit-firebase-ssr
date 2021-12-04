import { Document } from './Document';

export class Count extends Document {
	constructor(data: Object = null) {
		super(data);
		this._load(data);
		this._dbFields.push('count');
	}

	_collection = 'counters';
	count = 0;
}
