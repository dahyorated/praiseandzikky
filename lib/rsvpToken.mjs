// Signed proof that /api/match confirmed this guest. /api/rsvp refuses to write
// without one, which stops anyone posting an RSVP for a name they only guessed.

import crypto from 'node:crypto';

const TTL_MS = 30 * 60 * 1000;

function secret() {
  const value = process.env.RSVP_TOKEN_SECRET;
  if (!value) throw new Error('RSVP_TOKEN_SECRET is not set');
  return value;
}

function sign(body) {
  return crypto.createHmac('sha256', secret()).update(body).digest('base64url');
}

export function issueToken(guestKey) {
  const body = Buffer.from(`${guestKey}|${Date.now() + TTL_MS}`).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifyToken(token) {
  const [body, signature] = String(token ?? '').split('.');
  if (!body || !signature) return { valid: false };

  const expected = sign(body);
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) {
    return { valid: false };
  }

  const decoded = Buffer.from(body, 'base64url').toString('utf8');
  const split = decoded.lastIndexOf('|');
  if (split === -1) return { valid: false };

  const expiry = Number(decoded.slice(split + 1));
  if (!Number.isFinite(expiry) || Date.now() > expiry) return { valid: false };

  return { valid: true, guestKey: decoded.slice(0, split) };
}
