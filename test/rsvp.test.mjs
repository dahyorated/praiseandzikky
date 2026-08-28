// Runs the real /api/rsvp handler with Firebase and Resend mocked out.
//
// Written after a reference to an undefined variable shipped past both a
// syntax check and a read through. Only actually executing the handler catches
// that class of mistake.
//
//   node --experimental-test-module-mocks --test test/rsvp.test.mjs

import test, { mock } from 'node:test';
import assert from 'node:assert/strict';

process.env.RSVP_TOKEN_SECRET = 'test-secret-for-the-suite';

const GUESTS = [
  { key: 'adedayo_dayo', name: 'Dayo Adedayo', plusOnes: 1, code: 'PETFKQ' },
  { key: 'balogun_bolu', name: 'Bolu Balogun', plusOnes: 0, code: 'PEPJHN' },
];

let written = null;
let sent = null;
let responded = false;
// ESM exports are immutable, so the outage is simulated through the mock
// rather than by reassigning sendEmail.
let sendResult = { sent: true, id: 'test' };

mock.module('../lib/firebaseRest.mjs', {
  namedExports: {
    loadGuests: async () => GUESTS,
    guestHasResponded: async () => responded,
    writeRsvps: async (records) => {
      written = records;
    },
    writeGuests: async () => {},
  },
});

mock.module('../lib/resend.mjs', {
  namedExports: {
    emailConfigured: () => true,
    sendEmail: async (payload) => {
      sent = payload;
      return sendResult;
    },
  },
});

const { issueToken } = await import('../lib/rsvpToken.mjs');
const { default: handler } = await import('../api/rsvp.js');

const makeRes = () => {
  const res = { code: 0, body: null, headers: {} };
  res.status = (c) => ((res.code = c), res);
  res.json = (b) => ((res.body = b), res);
  res.setHeader = (k, v) => (res.headers[k] = v);
  return res;
};

const post = async (body) => {
  written = null;
  sent = null;
  const res = makeRes();
  await handler({ method: 'POST', body, headers: { 'x-forwarded-for': `${Math.random()}` } }, res);
  return res;
};

const validBody = (extra = {}) => ({
  token: issueToken('adedayo_dayo'),
  phone: '+2348012345678',
  email: 'dayo@example.com',
  attending: true,
  asoEbi: false,
  guests: [],
  website: '',
  ...extra,
});

test('a lone attendee is written with their code and emailed', async () => {
  responded = false;
  const res = await post(validBody());

  assert.equal(res.code, 200);
  assert.equal(res.body.status, 'ok');
  assert.deepEqual(res.body.codes, [{ name: 'Dayo Adedayo', code: 'PETFKQ' }]);

  assert.equal(written.adedayo_dayo.code, 'PETFKQ');
  assert.equal(written.adedayo_dayo.attending, true);
  assert.equal(written.adedayo_dayo.isPrimary, true);

  assert.equal(sent.to, 'dayo@example.com');
  assert.ok(sent.subject.includes('Dayo'));
  assert.ok(sent.text.includes('#PETFKQ'));
});

test('a party member gets a derived code, in the same email', async () => {
  responded = false;
  const res = await post(
    validBody({ guests: [{ firstName: 'Sade', lastName: 'Adedayo', attending: true, asoEbi: false }] })
  );

  assert.equal(res.body.status, 'ok');
  assert.equal(written.adedayo_dayo.code, 'PETFKQ');
  assert.equal(written['adedayo_dayo_g1'].code, 'PETFKQ-2');
  assert.equal(written['adedayo_dayo_g1'].isPrimary, false);

  assert.equal(sent.to, 'dayo@example.com');
  assert.ok(sent.text.includes('#PETFKQ'));
  assert.ok(sent.text.includes('#PETFKQ-2'));
});

test('someone who is not coming is written but never emailed', async () => {
  responded = false;
  const res = await post(validBody({ attending: false }));

  assert.equal(res.body.status, 'ok');
  assert.deepEqual(res.body.codes, []);
  assert.equal(written.adedayo_dayo.attending, false);
  assert.equal(sent, null, 'no email for a regret');
});

test('a guest not attending is left out of the email, the invitee is not', async () => {
  responded = false;
  await post(
    validBody({ guests: [{ firstName: 'Sade', lastName: 'Adedayo', attending: false, asoEbi: false }] })
  );

  assert.ok(sent.text.includes('#PETFKQ'));
  assert.ok(!sent.text.includes('PETFKQ-2'), 'a guest who declined has no reception code');
});

test('a failed send does not fail the RSVP', async () => {
  responded = false;
  sendResult = { sent: false, error: 'simulated outage' };
  const res = await post(validBody());
  sendResult = { sent: true, id: 'test' };

  assert.equal(res.code, 200);
  assert.equal(res.body.status, 'ok');
  assert.deepEqual(res.body.codes, [{ name: 'Dayo Adedayo', code: 'PETFKQ' }], 'codes still returned');
  assert.ok(written, 'the record is still written');
});

test('an oversized party is refused against the stored allowance', async () => {
  responded = false;
  const res = await post(
    validBody({
      guests: [
        { firstName: 'A', lastName: 'One', attending: true, asoEbi: false },
        { firstName: 'B', lastName: 'Two', attending: true, asoEbi: false },
      ],
    })
  );

  assert.equal(res.code, 400);
  assert.equal(res.body.status, 'too_many_guests');
  assert.equal(res.body.plusOnes, 1);
  assert.equal(written, null, 'nothing written');
  assert.equal(sent, null, 'nothing sent');
});

test('a second RSVP is refused and sends nothing', async () => {
  responded = true;
  const res = await post(validBody());

  assert.equal(res.body.status, 'already');
  assert.equal(written, null);
  assert.equal(sent, null);
});

test('a blank email is refused before anything is written', async () => {
  responded = false;
  const res = await post(validBody({ email: '' }));

  assert.equal(res.code, 400);
  assert.equal(res.body.status, 'bad_email');
  assert.equal(written, null);
});

test('the honeypot answers ok, writes nothing and sends nothing', async () => {
  responded = false;
  const res = await post(validBody({ website: 'http://spam.example' }));

  assert.equal(res.body.status, 'ok');
  assert.equal(written, null);
  assert.equal(sent, null);
});

test('a forged token is refused', async () => {
  responded = false;
  const res = await post(validBody({ token: 'not.a.real.token' }));

  assert.equal(res.code, 401);
  assert.equal(res.body.status, 'expired');
  assert.equal(written, null);
});
