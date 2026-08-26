import type { MatchResponse, RsvpRequest, RsvpResponse } from '../types';

// The browser no longer touches the database. Both calls go through serverless
// functions so the guest list stays server-side and the write cannot happen
// without a token proving the name was matched.
export const WHATSAPP_LINK = 'https://wa.me/2348026813305';

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });

  // Every handled outcome comes back as JSON, including the 4xx and 5xx ones,
  // so the caller can branch on status rather than on the HTTP code.
  const body = await response.json().catch(() => null);
  if (!body || typeof body.status !== 'string') {
    throw new Error(`Unexpected response from ${path}`);
  }
  return body as T;
}

export function matchGuest(name: string): Promise<MatchResponse> {
  return postJson<MatchResponse>('/api/match', { name });
}

export function submitRsvp(payload: RsvpRequest): Promise<RsvpResponse> {
  return postJson<RsvpResponse>('/api/rsvp', payload);
}
