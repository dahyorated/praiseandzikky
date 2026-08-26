// Server-side Realtime Database access using a service account.
//
// The account credential bypasses database rules, which is what lets the rules
// deny every client read and write while these functions still work. Nothing
// here may ever run in a browser.
//
// This is the standard JWT bearer flow rather than firebase-admin, to keep the
// project free of SDK dependencies.

import crypto from 'node:crypto';

const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SCOPES = [
  'https://www.googleapis.com/auth/firebase.database',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

// A freshly imported name can take up to this long to go live on a warm
// instance. Accepted deliberately, do not engineer it away.
const GUEST_CACHE_MS = 5 * 60 * 1000;

let cachedToken = null;
let cachedGuests = null;

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');

  // Base64 so the PEM newlines survive the environment variable intact.
  const json = raw.trim().startsWith('{')
    ? raw
    : Buffer.from(raw, 'base64').toString('utf8');

  const parsed = JSON.parse(json);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing client_email or private_key');
  }
  return parsed;
}

function databaseUrl() {
  const url = process.env.FIREBASE_DATABASE_URL;
  if (!url) throw new Error('FIREBASE_DATABASE_URL is not set');
  return url.replace(/\/$/, '');
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const account = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: SCOPES,
      aud: TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600,
    })
  );

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(account.private_key, 'base64url');
  const assertion = `${header}.${claims}.${signature}`;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed with status ${response.status}`);
  }

  const body = await response.json();
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

async function request(path, options = {}) {
  const token = await accessToken();
  const response = await fetch(`${databaseUrl()}/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Database ${options.method ?? 'GET'} ${path} failed with ${response.status}`);
  }
  return response.json();
}

/** @returns {Promise<{key: string, name: string}[]>} */
export async function loadGuests() {
  if (cachedGuests && cachedGuests.loadedAt > Date.now() - GUEST_CACHE_MS) {
    return cachedGuests.value;
  }

  const data = await request('guests.json');
  const guests = Object.entries(data ?? {})
    .map(([key, value]) => ({ key, name: value?.name ?? '' }))
    .filter((guest) => guest.name);

  cachedGuests = { value: guests, loadedAt: Date.now() };
  return guests;
}

export async function guestHasResponded(guestKey) {
  const existing = await request(`rsvps/${encodeURIComponent(guestKey)}.json?shallow=true`);
  return existing !== null;
}

/** Writes every person in the party in one atomic request. */
export async function writeRsvps(records) {
  await request('rsvps.json', { method: 'PATCH', body: JSON.stringify(records) });
}

// Writes only ever addressed at /guests. Merge adds and updates without
// touching anything else. Replace swaps the node wholesale but still cannot
// reach /rsvps, unlike a console import done at the root.
export async function writeGuests(records, { replace = false } = {}) {
  await request('guests.json', {
    method: replace ? 'PUT' : 'PATCH',
    body: JSON.stringify(records),
  });
}
