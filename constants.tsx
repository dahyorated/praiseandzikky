import { WeddingEvent, GalleryImage } from './types';

export const BANK_DETAILS = {
  bankName: "Pocketapp",
  accountNumber: "3565157633",
  accountName: "Introduction Ceremony",
  message: "Your presence is our greatest gift, but if you wish to honor us with a monetary token, it would be deeply appreciated as we start our new chapter together."
};

export const WEDDING_EVENTS: WeddingEvent[] = [
  {
    id: 'proposal',
    title: 'The Proposal',
    date: 'December 3rd 2025',
    time: 'Sunset, 7:00 PM',
    venue: 'Twin Waters',
    address: 'Lekki, Lagos',
    dressCode: 'Summer Dinner',
    colors: ['Biege', 'White'],
    theme: 'Under the Stars',
    description: 'Where Ezekiel got on one knee and Praise said yes to forever.',
    image: 'https://sgaiservices.blob.core.windows.net/wedding/kneel1.jpg',
    eventImages: [
      'https://sgaiservices.blob.core.windows.net/wedding/proposal-decor1.jpg',
      'https://sgaiservices.blob.core.windows.net/wedding/proposal-progress.jpg',
      'https://sgaiservices.blob.core.windows.net/wedding/proposal-ring.jpg',
      'https://sgaiservices.blob.core.windows.net/wedding/pne-proposal1.jpg',
      'https://sgaiservices.blob.core.windows.net/wedding/pne-proposal2.jpg',
      'https://sgaiservices.blob.core.windows.net/wedding/pne-proposal3.jpg',
      'https://sgaiservices.blob.core.windows.net/wedding/pne-proposal4.jpg',
      'https://sgaiservices.blob.core.windows.net/wedding/pne-proposal5.jpg',
      'https://sgaiservices.blob.core.windows.net/wedding/pne-proposal6.jpg'
    ]
  },
  {
    id: 'introduction',
    title: 'Introduction Ceremony',
    date: 'March 17th 2026',
    time: 'i:00 PM (No African time)',
    venue: 'Chief M.I Aboaba Residence',
    address: 'Magodo, Lagos',
    dressCode: 'Simple Native',
    colors: ['Any Color'],
    theme: 'Two Families, One Path',
    description: 'The formal meeting of our families. A beautiful blend of heritage, respect, and the beginning of a lifelong union.',
    image: 'https://sgaiservices.blob.core.windows.net/wedding/pne-selfie.jpg',
    eventImages: [
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'civil',
    title: 'Civil Wedding',
    date: 'March 18th 2026',
    time: '9:00 AM (No African time)',
    venue: 'Canvas Concept Space',
    address: '36 Rasheed Alaba Williams Street, Lekki Phase 1, Lagos',
    dressCode: 'Semi Formal',
    colors: ['Black with a Touch of White'],
    theme: 'Legal & Loyal',
    description: 'A quiet, intimate exchange of vows before the law. Signed, sealed, and delivered in love. With an intimate dinner to follow.',
    image: 'https://sgaiservices.blob.core.windows.net/wedding/pne-civil.png',
    eventImages: [
      'https://images.unsplash.com/photo-1515922754546-3e40e1942d7b?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'white',
    title: 'White Wedding',
    date: 'January 28th 2027',
    time: '10:00 AM',
    venue: 'This Great House',
    address: '9 Bolaji Benson St, Ikorodu Lagos',
    dressCode: 'Classy and Elegant',
    colors: ['Any Color'],
    theme: 'The Elegant Union',
    description: 'The Christian celebration. A walk down the aisle, a promise before God and each other in the presence of family and friends.',
    image: 'https://sgaiservices.blob.core.windows.net/wedding/pne-white.png',
    eventImages: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1465495910483-0d674b0b7a05?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: 'traditional',
    title: 'Traditional Wedding and Reception',
    date: 'January 30th 2027',
    time: '9:00 AM',
    venue: 'To be communicated',
    address: 'To be communicated',
    dressCode: 'Native Attire (Aso-Ebi)',
    colors: ['Champagne Gold', 'Espresso Brown'],
    theme: 'Cultural Grandeur',
    description: 'Celebrating our roots with music, dance, and centuries-old traditions. A vibrant explosion of culture. Grand finale reception to follow.',
    image: 'https://sgaiservices.blob.core.windows.net/wedding/trad2hd.png',
    eventImages: [
      'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

export const GALLERY: GalleryImage[] = [
  { url: 'https://sgaiservices.blob.core.windows.net/wedding/IMG_7376.jpg', caption: 'Out for Family', category: 'ceremony' },
  { url: 'https://sgaiservices.blob.core.windows.net/wedding/IMG_7495.jpg', caption: 'Ebony Life', category: 'outing' },
  { url: 'https://sgaiservices.blob.core.windows.net/wedding/IMG_7529.jpg', caption: 'One Asian restaurent like that', category: 'outing' },
];
