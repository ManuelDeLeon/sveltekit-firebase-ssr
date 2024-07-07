import type { AnyObject } from './types';

export class Doc {
	_id: string = '';
	_load(data?: AnyObject) {
		if (data) {
			const target: AnyObject = this as AnyObject;
			Object.keys(data).forEach((key) => {
				if (Object.prototype.hasOwnProperty.call(target, key)) {
					target[key] = data[key];
				}
			});
		}
	}
	_obj() {
		const obj: AnyObject = {};
		Object.keys(this).forEach((k) => {
			obj[k] = this[k as keyof Doc];
		});
		return obj;
	}
}
