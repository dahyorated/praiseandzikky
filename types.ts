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
  rsvpLink?: string;
  rsvpOpen?: boolean; // added: controls whether RSVP is clickable
  eventImages?: string[];
}

export interface GalleryImage {
  url: string;
  caption: string;
  category: 'proposal' | 'pre-wedding' | 'ceremony' | 'outing';
}
