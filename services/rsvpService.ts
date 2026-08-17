import type { RsvpSubmission } from '../types';

// Realtime Database REST endpoint. A PATCH against /rsvps writes every person in
// the party in one atomic request, so a group either lands whole or not at all.
// The Firebase SDK is not needed. Access is controlled by the database rules,
// which allow create-only writes and no reads.
const DATABASE_URL = 'https://praizandzikky-default-rtdb.europe-west1.firebasedatabase.app';

export const WHATSAPP_LINK = 'https://wa.me/2348026813305';

// Leading timestamp keeps keys in submission order, the suffix keeps them unique.
function newEntryKey(index: number): string {
  return `${Date.now()}_${index}_${Math.random().toString(36).slice(2, 10)}`;
}

export function newPartyId(): string {
  return `party_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function submitRsvps(entries: RsvpSubmission[]): Promise<void> {
  const payload: Record<string, RsvpSubmission> = {};
  entries.forEach((entry, index) => {
    payload[newEntryKey(index)] = entry;
  });

  const response = await fetch(`${DATABASE_URL}/rsvps.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`RSVP write failed with status ${response.status}`);
  }
}
