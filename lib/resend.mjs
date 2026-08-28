// Resend over plain fetch, no SDK, matching how the rest of this project talks
// to Firebase.
//
// Sending must never be able to fail an RSVP. Every path here returns a result
// rather than throwing, so the caller can log and carry on.

const ENDPOINT = 'https://api.resend.com/emails';

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

/**
 * @returns {Promise<{sent: boolean, skipped?: string, error?: string, id?: string}>}
 */
export async function sendEmail({ to, subject, html, text }) {
  if (!emailConfigured()) {
    return { sent: false, skipped: 'RESEND_API_KEY or RESEND_FROM is not set' };
  }
  if (!to) {
    return { sent: false, skipped: 'no recipient' };
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: [to],
        subject,
        html,
        text,
        // Optional. Gmail treats a real reply address as evidence this is
        // personal correspondence rather than a campaign.
        ...(process.env.RESEND_REPLY_TO ? { reply_to: process.env.RESEND_REPLY_TO } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { sent: false, error: `status ${response.status} ${detail.slice(0, 200)}` };
    }

    const body = await response.json().catch(() => ({}));
    return { sent: true, id: body?.id };
  } catch (error) {
    return { sent: false, error: error.message };
  }
}
