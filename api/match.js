// POST /api/match  { name }
//
// Returns at most one suggestion, never a count and never the list. The guest
// list itself never leaves this function.

import { matchName } from '../lib/names.mjs';
import { loadGuests } from '../lib/firebaseRest.mjs';
import { issueToken } from '../lib/rsvpToken.mjs';
import { allow, callerIp } from '../lib/rateLimit.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'method_not_allowed' });
  }

  if (!allow(`match:${callerIp(req)}`, 20, 60_000)) {
    return res.status(429).json({ status: 'slow_down' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const name = typeof body?.name === 'string' ? body.name.slice(0, 120) : '';

  if (!name.trim()) {
    return res.status(400).json({ status: 'none' });
  }

  let guests;
  try {
    guests = await loadGuests();
  } catch (error) {
    console.error('Guest list unavailable:', error.message);
    return res.status(503).json({ status: 'unavailable' });
  }

  const result = matchName(name, guests);

  if (result.status === 'exact') {
    return res.status(200).json({
      status: 'exact',
      name: result.guest.name,
      token: issueToken(result.guest.key),
      plusOnes: result.guest.plusOnes,
    });
  }

  if (result.status === 'suggest') {
    return res.status(200).json({
      status: 'suggest',
      picks: result.picks.slice(0, 2).map((guest) => ({
        name: guest.name,
        token: issueToken(guest.key),
        plusOnes: guest.plusOnes,
      })),
    });
  }

  return res.status(200).json({ status: result.status });
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
