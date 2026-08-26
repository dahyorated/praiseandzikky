export interface WeddingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  dressCode?: string;
  colors?: string[];
  theme?: string;
  description?: string;
  image?: string;
  eventImages?: string[];
  // Photos are not available, so View Highlights opens a notice instead of a
  // gallery. Overrides eventImages.
  photosPending?: boolean;
  // Wording for that notice. Defaults to "the day has not happened yet", so set
  // this for events that have passed but whose photos are still to come.
  photosPendingMessage?: string;
}

export interface GalleryImage {
  url: string;
  caption: string;
  category: 'proposal' | 'pre-wedding' | 'ceremony' | 'outing';
}

// What /api/match sends back. Never more than two picks, never a count.
export interface MatchPick {
  name: string;
  token: string;
}

export interface MatchResponse {
  status: 'exact' | 'suggest' | 'single' | 'none' | 'slow_down' | 'unavailable';
  name?: string;
  token?: string;
  picks?: MatchPick[];
}

export interface RsvpGuestInput {
  firstName: string;
  lastName: string;
  attending: boolean;
}

export interface RsvpRequest {
  token: string;
  phone: string;
  email: string;
  attending: boolean;
  guests: RsvpGuestInput[];
  website: string;
}

export interface RsvpResponse {
  status: 'ok' | 'already' | 'expired' | 'bad_phone' | 'bad_email' | 'slow_down' | 'unavailable';
  name?: string;
}
