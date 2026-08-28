// Confirmation email. Inline styles only, since email clients strip stylesheets,
// and a plain text part alongside the HTML because text-only improves
// deliverability and some clients prefer it.
//
// Deliberately does not restate the event details. Those change, and a stale
// venue sitting in someone's inbox is worse than a link to the live page.

const SITE = 'https://praizandzikky.info';
// Served from public/, so it publishes to the site root at build time.
// Hosted rather than embedded, because email clients strip data URIs.
const CELEBRATION_GIF = `${SITE}/thankyou.gif`;
// The gifts section on the site, so the amounts and account details live in one
// place rather than going stale in someone's inbox.
const GIFTS_LINK = `${SITE}/#registry`;
const GOLD = '#C9A961';
const INK = '#241812';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {object} input
 * @param {string} input.firstName
 * @param {{name: string, code: string}[]} input.people  everyone attending, invitee first
 * @param {boolean} input.asoEbi  whether anyone in the party asked about Aso Ebi
 */
export function confirmationEmail({ firstName, people, asoEbi }) {
  const subject = `You're on the list, ${firstName}`;
  const many = people.length > 1;

  const codeRows = people
    .map(
      (person) => `
      <tr>
        <td style="padding:14px 18px;border:1px solid #EADFC8;border-radius:10px;background:#FBF7EF;">
          <div style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${GOLD};font-weight:700;">
            ${escapeHtml(person.name)}
          </div>
          <div style="font-size:26px;letter-spacing:3px;font-weight:700;color:${INK};margin-top:4px;font-family:'Courier New',monospace;">
            #${escapeHtml(person.code)}
          </div>
        </td>
      </tr>
      <tr><td style="height:10px;line-height:10px;">&nbsp;</td></tr>`
    )
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#F6EFE0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6EFE0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #EADFC8;">
        <tr><td style="height:6px;background:linear-gradient(90deg,#EADFC8,${GOLD},#EADFC8);line-height:6px;">&nbsp;</td></tr>
        <tr><td style="padding:36px 32px 8px;text-align:center;">
          <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${GOLD};font-weight:700;">Praise &amp; Ezekiel</div>
          <h1 style="margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:${INK};">
            Thank you for RSVPing
          </h1>
        </td></tr>
        <tr><td style="padding:16px 32px 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#5b5048;">
          <p style="margin:0 0 16px;">Hello ${escapeHtml(firstName)},</p>
          <p style="margin:0 0 16px;">
            We are so glad you can join us. ${many ? 'Below are the access codes for your party.' : 'Below is your access code.'}
            Please bring ${many ? 'them' : 'it'} to the reception, on your phone or written down.
          </p>
        </td></tr>
        <tr><td style="padding:22px 32px 4px;text-align:center;">
          <img src="${CELEBRATION_GIF}" width="400" alt="Us, losing it, because you said yes"
               style="width:400px;max-width:100%;height:auto;display:block;margin:0 auto;border:0;border-radius:14px;" />
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;font-style:italic;color:#8a7d70;padding-top:10px;">
            Us, the moment your RSVP landed.
          </div>
        </td></tr>
        <tr><td style="padding:12px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${codeRows}</table>
        </td></tr>
        ${
          asoEbi
            ? `<tr><td style="padding:6px 32px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#5b5048;">
                 <p style="margin:0;">You asked about Aso Ebi, so we will be in touch with the fabric details and prices closer to the day.</p>
               </td></tr>`
            : ''
        }
        <tr><td style="padding:20px 32px 36px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#5b5048;">
          <p style="margin:0 0 20px;">
            All the dates, venues and dress codes live on
            <a href="${SITE}" style="color:${GOLD};font-weight:700;">praizandzikky.info</a>.
          </p>
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:17px;color:${INK};">
            See you soon, and please, come looking boogie.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="border-top:1px solid #EADFC8;padding-top:22px;text-align:center;font-family:Helvetica,Arial,sans-serif;">
              <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${GOLD};font-weight:700;">Gifts</div>
              <p style="margin:10px 0 14px;font-size:15px;line-height:1.6;color:#5b5048;">
                We know we said your presence is gift enough. And it is. But money does make
                the couple smile :)
              </p>
              <a href="${GIFTS_LINK}" style="display:inline-block;padding:11px 26px;border:2px solid ${GOLD};border-radius:999px;color:${GOLD};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                See the gift details
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:26px 32px 30px;text-align:center;font-family:Georgia,serif;font-size:16px;color:${GOLD};">
          #ALifetimeOfSunshine
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Hello ${firstName},`,
    '',
    `We are so glad you can join us. ${many ? 'Here are the access codes for your party.' : 'Here is your access code.'}`,
    `Please bring ${many ? 'them' : 'it'} to the reception.`,
    '',
    '(There is a gif of us dancing badly here. Your email is hiding it. Trust us, it was a lot.)',
    '',
    ...people.map((person) => `  ${person.name}: #${person.code}`),
    '',
    ...(asoEbi
      ? ['You asked about Aso Ebi, so we will be in touch with the fabric details and prices closer to the day.', '']
      : []),
    `All the dates, venues and dress codes are on ${SITE}`,
    '',
    'See you soon, and please, come looking boogie.',
    '',
    'GIFTS',
    'We know we said your presence is gift enough. And it is.',
    'But money does make the couple smile :)',
    '',
    `Here you go: ${GIFTS_LINK}`,
    '',
    '#ALifetimeOfSunshine',
    'Praise & Ezekiel',
  ].join('\n');

  return { subject, html, text };
}
