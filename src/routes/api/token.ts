import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
export const post: RequestHandler<string> = async (event) => {
	const payload = await event.request.json();
	const token: string = payload.token || '';
	return {
		headers: {
			'set-cookie': cookie.serialize('token', token, {
				path: '/',
				httpOnly: true
			})
		}
	};
};
