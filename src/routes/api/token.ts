import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
export const post: RequestHandler<string, { token: string }> = (request) => {
	const token: string = request.body?.token || '';
	return {
		headers: {
			'set-cookie': cookie.serialize('token', token, {
				path: '/',
				httpOnly: true
			})
		}
	};
};
