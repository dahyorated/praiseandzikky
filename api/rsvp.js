// POST /api/rsvp  { token, phone, email, attending, guests[], website }
//
// Refuses to write without a token issued by /api/match. The named invitee
// vouches for their party, so additional guests are not checked against the
// list themselves.

import { loadGuests } from '../lib/firebaseRest.mjs';
import { guestHasResponded, writeRsvps } from '../lib/firebaseRest.mjs';
import { verifyToken } from '../lib/rsvpToken.mjs';
import { allow, callerIp } from '../lib/rateLimit.mjs';

const MAX_ADDITIONAL_GUESTS = 4;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ status: 'method_not_allowed' });
  }

  if (!allow(`rsvp:${callerIp(req)}`, 10, 60_000)) {
    return res.status(429).json({ status: 'slow_down' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body ?? {};

  // Honeypot. Real guests never see this field, so anything in it is a bot.
  // Answer as though it worked and write nothing.
  if (typeof body.website === 'string' && body.website.trim()) {
    return res.status(200).json({ status: 'ok' });
  }

  const check = verifyToken(body.token);
  if (!check.valid) {
    return res.status(401).json({ status: 'expired' });
  }

  const phone = String(body.phone ?? '').trim().slice(0, 40);
  if (phone.replace(/\D/g, '').length < 6) {
    return res.status(400).json({ status: 'bad_phone' });
  }

  const email = String(body.email ?? '').trim().slice(0, 120);
  if (email && !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ status: 'bad_email' });
  }

  const attending = body.attending === true;
  const party = Array.isArray(body.guests) ? body.guests.slice(0, MAX_ADDITIONAL_GUESTS) : [];

  let guests;
  try {
    guests = await loadGuests();
  } catch (error) {
    console.error('Guest list unavailable:', error.message);
    return res.status(503).json({ status: 'unavailable' });
  }

  const invitee = guests.find((guest) => guest.key === check.guestKey);
  if (!invitee) {
    // On the list when the token was issued, gone now.
    return res.status(401).json({ status: 'expired' });
  }

  try {
    if (await guestHasResponded(check.guestKey)) {
      return res.status(200).json({ status: 'already' });
    }
  } catch (error) {
    console.error('Duplicate check failed:', error.message);
    return res.status(503).json({ status: 'unavailable' });
  }

  const submittedAt = new Date().toISOString();
  const shared = {
    phone,
    email,
    partyId: check.guestKey,
    partySize: 1 + party.length,
    submittedBy: invitee.name,
    submittedAt,
  };

  // Keyed on the guest key, so a second attempt cannot create a duplicate row.
  const records = {
    [check.guestKey]: {
      ...shared,
      name: invitee.name,
      firstName: firstWord(invitee.name),
      lastName: restOfName(invitee.name),
      attending,
      isPrimary: true,
    },
  };

  party.forEach((member, index) => {
    const firstName = String(member?.firstName ?? '').trim().slice(0, 60);
    const lastName = String(member?.lastName ?? '').trim().slice(0, 60);
    if (!firstName || !lastName) return;

    records[`${check.guestKey}_g${index + 1}`] = {
      ...shared,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      attending: member?.attending === true,
      isPrimary: false,
    };
  });

  try {
    await writeRsvps(records);
  } catch (error) {
    console.error('RSVP write failed:', error.message);
    return res.status(503).json({ status: 'unavailable' });
  }

  return res.status(200).json({ status: 'ok', name: invitee.name });
}

function firstWord(name) {
  return name.split(/\s+/)[0] ?? name;
}

function restOfName(name) {
  return name.split(/\s+/).slice(1).join(' ') || name;
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
