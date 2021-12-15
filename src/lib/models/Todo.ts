import type { AnyObject } from '$lib/utils/types';
import { Document } from './Document';
export class Todo extends Document {
	constructor(data: AnyObject = {}) {
		super(data);
		this._load(data);
		this._dbFields.push('text', 'done');
	}

	_collection = 'todos';
	text = '';
	done = false;
	pending_delete = false;
}
