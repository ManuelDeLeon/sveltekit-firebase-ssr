export type AnyObject = Record<string, unknown>;
export type Fetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;

export type UserInfo = {
	email: string | null;
	uid: string;
};

export type NotUndefined<T> = T extends undefined ? never : T;
