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
  // How many extra guests this invitation covers.
  plusOnes: number;
}

export interface MatchResponse {
  status: 'exact' | 'suggest' | 'single' | 'none' | 'slow_down' | 'unavailable';
  name?: string;
  token?: string;
  plusOnes?: number;
  picks?: MatchPick[];
}

export interface RsvpGuestInput {
  firstName: string;
  lastName: string;
  attending: boolean;
  asoEbi: boolean;
}

export interface RsvpRequest {
  token: string;
  phone: string;
  email: string;
  attending: boolean;
  asoEbi: boolean;
  guests: RsvpGuestInput[];
  website: string;
}

export interface AccessCode {
  name: string;
  code: string;
}

export interface RsvpResponse {
  status: 'ok' | 'already' | 'expired' | 'bad_phone' | 'bad_email' | 'too_many_guests' | 'slow_down' | 'unavailable';
  name?: string;
  plusOnes?: number;
  /** Everyone attending, with their reception code. Empty for a regret. */
  codes?: AccessCode[];
}
