/**
 * Spotify "top tracks" — Vercel Serverless Function (Node.js).
 *
 * Required environment variables:
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 *
 * Required OAuth scope on refresh token:
 *   user-top-read
 */

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function clampLimit(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 9;
  return Math.min(50, Math.max(1, Math.floor(n)));
}

function normalizeTimeRange(value) {
  const allowed = new Set(['short_term', 'medium_term', 'long_term']);
  return allowed.has(value) ? value : 'medium_term';
}

async function getAccessToken(clientId, clientSecret, refreshToken) {
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const msg = await tokenRes.text();
    throw new Error(`token_refresh_failed:${msg}`);
  }

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token;
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

  const limit = clampLimit(req.query?.limit);
  const timeRange = normalizeTimeRange(req.query?.time_range);

  try {
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    if (!accessToken) {
      sendJson(res, 502, { error: 'no_access_token' });
      return;
    }

    const topTracksRes = await fetch(
      `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=${timeRange}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!topTracksRes.ok) {
      const msg = await topTracksRes.text();
      console.error('Spotify top tracks failed', msg);
      sendJson(res, 502, { error: 'spotify_top_tracks_error' });
      return;
    }

    const data = await topTracksRes.json();
    const tracks = (data.items || []).map((track) => {
      const images = track.album?.images || [];
      return {
        id: track.id,
        title: track.name || '',
        artist: (track.artists || []).map((a) => a.name).join(', '),
        url: track.external_urls?.spotify || '',
        imageUrl: images[0]?.url || '',
      };
    });

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );
    sendJson(res, 200, { tracks, limit, timeRange });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'internal_error' });
  }
};
