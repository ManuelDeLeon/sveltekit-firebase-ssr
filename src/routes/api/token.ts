import cookie from 'cookie';
export const post = (request) => {
	return {
		headers: {
			'set-cookie': cookie.serialize('token', request.body.token, {
				path: '/',
				httpOnly: true
			})
		}
	};
};
