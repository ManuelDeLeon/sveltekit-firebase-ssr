import type { AnyObject } from '$lib/models/types';
import { Document } from './Document';

export class Count extends Document {
	constructor(data: AnyObject = {}) {
		super(data);
		this._load(data);
		this._dbFields.push('count');
	}

	_collection = 'counters';
	count = 0;
}
