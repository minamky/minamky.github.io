#!/usr/bin/env node
/**
 * One-time: opens Spotify login → captures redirect → prints SPOTIFY_REFRESH_TOKEN.
 *
 * Prerequisite: In https://developer.spotify.com/dashboard → your app → Settings,
 * add exactly this Redirect URI (under "Redirect URIs"):
 *   http://127.0.0.1:8888/callback
 *
 * Run (from repo root):
 *   SPOTIFY_CLIENT_ID=your_id SPOTIFY_CLIENT_SECRET=your_secret node scripts/get-spotify-refresh-token.mjs
 *
 * Optional (default matches Spotify settings above):
 *   SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
 */

import http from 'http';
import { URL } from 'url';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const REDIRECT_URI =
	process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:8888/callback';
const PORT = Number(process.env.SPOTIFY_LOCAL_PORT || '8888');

const scopes = [
	'user-read-currently-playing',
	'user-read-playback-state',
	'user-top-read',
].join(' ');

if (!CLIENT_ID || !CLIENT_SECRET) {
	console.error(
		'Missing env vars. Example:\n  SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/get-spotify-refresh-token.mjs\n'
	);
	process.exit(1);
}

const authURL =
	'https://accounts.spotify.com/authorize?' +
	new URLSearchParams({
		response_type: 'code',
		client_id: CLIENT_ID,
		scope: scopes,
		redirect_uri: REDIRECT_URI,
		show_dialog: 'true',
	});

function sendHtml(res, status, html) {
	res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
	res.end(html);
}

const server = http.createServer(async (req, res) => {
	let pathname;
	try {
		pathname = new URL(req.url || '/', `http://127.0.0.1:${PORT}`).pathname;
	} catch {
		sendHtml(res, 400, '<p>Bad request</p>');
		return;
	}

	if (pathname !== '/callback') {
		res.writeHead(404);
		res.end('Not found');
		return;
	}

	let u;
	try {
		u = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
	} catch {
		sendHtml(res, 400, '<p>Bad URL</p>');
		return;
	}

	const oauthError = u.searchParams.get('error');
	if (oauthError) {
		sendHtml(
			res,
			400,
			`<p>Spotify returned an error: <code>${oauthError}</code></p><p>Close this tab and fix Redirect URI / scopes in the dashboard.</p>`
		);
		console.error('OAuth error:', oauthError);
		server.close();
		process.exit(1);
		return;
	}

	const code = u.searchParams.get('code');
	if (!code) {
		sendHtml(res, 400, '<p>No <code>code</code> in callback URL.</p>');
		server.close();
		process.exit(1);
		return;
	}

	const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization:
				'Basic ' +
				Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
		},
		body: new URLSearchParams({
			grant_type: 'authorization_code',
			code,
			redirect_uri: REDIRECT_URI,
		}).toString(),
	});

	const body = await tokenRes.json().catch(() => ({}));
	if (!tokenRes.ok || !body.refresh_token) {
		sendHtml(
			res,
			500,
			`<p>Token exchange failed (${tokenRes.status})</p><pre>${JSON.stringify(body, null, 2)}</pre>`
		);
		console.error('Token exchange failed:', body);
		server.close();
		process.exit(1);
		return;
	}

	sendHtml(
		res,
		200,
		`<h1>Done</h1><p>You can close this tab. Copy the refresh token from your terminal into Vercel as <code>SPOTIFY_REFRESH_TOKEN</code>.</p>`
	);

	console.log('\n--- Copy this value into Vercel → SPOTIFY_REFRESH_TOKEN ---\n');
	console.log(body.refresh_token);
	console.log('\n--- Keep it secret (same as CLIENT_SECRET) ---\n');

	server.close();
	process.exit(0);
});

server.listen(PORT, '127.0.0.1', () => {
	console.log('\nStep A — Spotify Dashboard → your app → Settings');
	console.log('  Add Redirect URI (must match exactly):\n    ' + REDIRECT_URI);
	console.log('\nStep B — Open this link in your browser, log in, click Accept:\n');
	console.log(authURL);
	console.log('\nWaiting for redirect to /callback …\n');
});

server.on('error', (err) => {
	console.error('Could not start local server on', PORT, err.message);
	process.exit(1);
});
