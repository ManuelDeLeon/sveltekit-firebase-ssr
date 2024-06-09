import type { Doc } from '$lib/models/doc';
import type { AnyObject } from '$lib/models/types';

export function getDbObject<T extends Doc>(type: { new (): T }, document: T): Partial<Doc> {
	const doc = new type();
	doc._load(document as AnyObject);
	delete doc._id;

	const obj: AnyObject = {};
	Object.keys(document).forEach((k) => {
		obj[k] = document[k as keyof Doc];
	});
	return obj;
}
