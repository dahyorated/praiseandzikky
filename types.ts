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

// One record per person. Everyone submitted together shares a partyId, and
// carries the contact details of whoever filled the form in.
export interface RsvpSubmission {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  attending: boolean;
  isPrimary: boolean;
  submittedBy: string;
  partyId: string;
  partySize: number;
  submittedAt: string;
}
