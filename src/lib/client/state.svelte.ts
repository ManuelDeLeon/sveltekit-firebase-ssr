import type { NotUndefined, UserInfo } from '$lib/models/types';

export function reactive<T>(initialValue: T) {
	let value: T = $state(initialValue);
	return {
		get value() {
			return value;
		},
		set value(newValue: T) {
			value = newValue;
		}
	};
}

function shared<T>(initialValue: T) {
	let value: T = $state(initialValue);
	return (updatedValue?: NotUndefined<T>) => {
		if (typeof updatedValue !== 'undefined') {
			value = updatedValue;
		}
		return {
			get value() {
				return value;
			},
			set value(newValue: T) {
				value = newValue;
			}
		};
	};
}

export const useUser = shared<UserInfo | null>(null);
