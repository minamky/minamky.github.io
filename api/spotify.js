/**
 * Spotify "currently playing" — Vercel Serverless Function (Node.js).
 *
 * Required environment variables (host dashboard → Environment Variables):
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 *
 * Setup overview:
 *   1. https://developer.spotify.com/dashboard → Create app
 *   2. Redirect URI: add any valid URI (e.g. http://127.0.0.1:3000/callback)
 *   3. OAuth scopes: user-read-currently-playing user-read-playback-state
 *   4. One-time refresh token: run locally
 *      node scripts/get-spotify-refresh-token.mjs
 *      (see comments at top of that file; add Redirect URI in Spotify dashboard).
 */

function sendJson(res, statusCode, body) {
	res.statusCode = statusCode;
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	res.end(JSON.stringify(body));
}

function formatCurrentlyPlaying(data) {
	const item = data.item;
	if (!item) {
		return { isPlaying: false };
	}

	const isTrack = item.type === 'track';
	const title = item.name || '';
	let artist = '';
	let albumImageUrl = '';
	const songUrl = item.external_urls?.spotify || '';

	if (isTrack) {
		artist = (item.artists || []).map((a) => a.name).join(', ');
		const imgs = item.album?.images || [];
		albumImageUrl =
			imgs.find((i) => i.width === 640)?.url || imgs[0]?.url || '';
	} else if (item.type === 'episode') {
		artist = item.show?.name || 'Podcast';
		albumImageUrl = item.images?.[0]?.url || '';
	}

	return {
		isPlaying: Boolean(data.is_playing),
		title,
		artist,
		albumImageUrl,
		songUrl,
	};
}

module.exports = async function handler(req, res) {
	if (req.method === 'OPTIONS') {
		res.statusCode = 204;
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
		res.setHeader('Access-Control-Max-Age', '86400');
		res.end();
		return;
	}

	if (req.method !== 'GET') {
		sendJson(res, 405, { error: 'method_not_allowed' });
		return;
	}

	const clientId = process.env.SPOTIFY_CLIENT_ID;
	const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
	const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

	if (!clientId || !clientSecret || !refreshToken) {
		sendJson(res, 503, {
			error: 'missing_env',
			message: 'Spotify API credentials are not configured on the server.',
		});
		return;
	}

	try {
		const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization:
					'Basic ' +
					Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			}).toString(),
		});

		if (!tokenRes.ok) {
			console.error('Spotify token refresh failed', await tokenRes.text());
			sendJson(res, 502, { error: 'token_refresh_failed' });
			return;
		}

		const tokenJson = await tokenRes.json();
		const accessToken = tokenJson.access_token;
		if (!accessToken) {
			sendJson(res, 502, { error: 'no_access_token' });
			return;
		}

		const playingRes = await fetch(
			'https://api.spotify.com/v1/me/player/currently-playing',
			{
				headers: { Authorization: `Bearer ${accessToken}` },
			}
		);

		if (playingRes.status === 204) {
			res.setHeader(
				'Cache-Control',
				'public, s-maxage=20, stale-while-revalidate=40'
			);
			sendJson(res, 200, { isPlaying: false });
			return;
		}

		if (!playingRes.ok) {
			sendJson(res, 502, { error: 'spotify_player_error' });
			return;
		}

		const data = await playingRes.json();
		const payload = formatCurrentlyPlaying(data);

		res.setHeader(
			'Cache-Control',
			'public, s-maxage=20, stale-while-revalidate=40'
		);
		sendJson(res, 200, payload);
	} catch (err) {
		console.error(err);
		sendJson(res, 500, { error: 'internal_error' });
	}
};
