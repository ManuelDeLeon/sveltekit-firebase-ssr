import type { AnyObject } from './types';

export class Doc {
	_load(data: AnyObject) {
		const target: AnyObject = this as AnyObject;
		Object.keys(data).forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(target, key)) {
				target[key] = data[key];
			}
		});
	}
	_id?: string = undefined;
}
