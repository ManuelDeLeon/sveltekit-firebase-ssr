import { Doc } from './doc';
import type { AnyObject } from './types';

export class Count extends Doc {
	constructor(data?: AnyObject) {
		super();
		this._load(data);
	}
	count = 0;
	uid = '';
}
