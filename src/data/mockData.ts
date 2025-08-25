export interface Host {
  name: string;
  avatar: string;
  role?: string;
  bio?: string;
  badges?: string[];
  languages?: string[];
}

export interface Listing {
  id: string
  title: string
  location: string
  province: string
  /** @deprecated Use priceNPR and priceUSD instead */
  price: number
  priceNPR: number
  priceUSD: number
  rating: number
  reviewCount: number
  images: string[]
  hostName: string // deprecated, use hosts array
  hostAvatar: string // deprecated, use hosts array
  hosts: Host[]
  maxGuests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  isVerified: boolean
  instantBook: boolean
  description: string
  latitude?: number
  longitude?: number
  status?: 'new' | 'recommended'
  createdAt?: string
}

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Traditional Newari House in Bhaktapur',
    location: 'Bhaktapur',
    province: 'Bagmati',
    price: 1445,
    priceNPR: 1445,
    priceUSD: 35,
    rating: 4.8,
    reviewCount: 127,
    images: [
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    hostName: 'Kamala Shakya',
    hostAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    hosts: [
      {
        name: 'Kamala Shakya',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Owner',
        bio: 'Kamala is a passionate host who loves sharing Newari culture and cuisine with guests. She has been running the homestay for over 10 years.',
        badges: ['Superhost', 'Local Expert'],
        languages: ['English', 'Nepali', 'Newari']
      },
      {
        name: 'Suresh Shakya',
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Co-Host',
        bio: 'Suresh helps with guest tours and is an expert in local history and temple architecture.',
        badges: ['Verified'],
        languages: ['Nepali', 'Newari', 'Hindi']
      }
    ],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Kitchen', 'Garden', 'Cultural Experience'],
    isVerified: true,
    instantBook: true,
    description: 'Experience authentic Newari culture in this beautifully preserved traditional house in the heart of Bhaktapur. Wake up to stunning views of ancient temples and enjoy home-cooked Newari meals with your host family.',
    latitude: 27.6728,
    longitude: 85.4298,
    status: 'new',
    createdAt: '2024-07-13T10:00:00Z'
  },
  {
    id: '2',
    title: 'Lakeside Mountain View Homestay',
    location: 'Pokhara',
    province: 'Gandaki',
    price: 2235,
    priceNPR:2235,
    priceUSD: 227,
    rating: 4.9,
    reviewCount: 89,
    images: [
      'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1630673/pexels-photo-1630673.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    hostName: 'Binod Gurung',
    hostAvatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    hosts: [
      {
        name: 'Binod Gurung',
        avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Owner',
        bio: 'Binod is a nature lover and mountain guide who enjoys introducing guests to the beauty of Pokhara and the Annapurna region.',
        badges: ['Superhost', 'Verified'],
        languages: ['English', 'Nepali', 'Gurung']
      },
      {
        name: 'Mina Gurung',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Chef',
        bio: 'Mina prepares delicious organic meals and shares family recipes with guests.',
        badges: ['Local Expert'],
        languages: ['Nepali', 'Hindi']
      }
    ],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Mountain View', 'Lakefront', 'Parking'],
    isVerified: true,
    instantBook: false,
    description: 'Wake up to breathtaking views of the Annapurna range and Phewa Lake. This family-run homestay offers comfortable accommodation with traditional Nepali hospitality and delicious organic meals.',
    latitude: 28.2096,
    longitude: 83.9856,
    status: 'recommended',
    createdAt: '2024-06-20T10:00:00Z'
  },
  {
    id: '3',
    title: 'Himalayan Village Farmhouse',
    location: 'Ghandruk',
    province: 'Gandaki',
    price: 3425,
    priceNPR: 3425,
    priceUSD: 219,
    rating: 4.7,
    reviewCount: 156,
    images: [
      'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1838630/pexels-photo-1838630.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    hostName: 'Maya Pun',
    hostAvatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    hosts: [
      {
        name: 'Maya Pun',
        avatar: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Owner',
        bio: 'Maya is a proud Gurung woman who loves to teach guests about local farming and traditional crafts.',
        badges: ['Superhost'],
        languages: ['English', 'Nepali', 'Gurung']
      }
    ],
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Mountain View', 'Organic Farm', 'Hiking Trails', 'Cultural Experience'],
    isVerified: true,
    instantBook: true,
    description: 'Immerse yourself in traditional Gurung culture in this authentic village homestay. Participate in daily farm activities, enjoy panoramic mountain views, and taste fresh organic produce.',
    latitude: 28.3167,
    longitude: 83.8167,
    createdAt: '2024-05-10T10:00:00Z'
  },
  {
    id: '4',
    title: 'Jungle Safari Lodge',
    location: 'Sauraha',
    province: 'Bagmati',
    price: 3355,
    priceNPR: 3355,
    priceUSD: 442,
    rating: 4.6,
    reviewCount: 203,
    images: [
      'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    hostName: 'Rajesh Tharu',
    hostAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    hosts: [
      {
        name: 'Rajesh Tharu',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Owner',
        bio: 'Rajesh is a wildlife enthusiast and expert safari guide. He loves sharing stories about the jungle and its animals.',
        badges: ['Verified', 'Local Expert'],
        languages: ['English', 'Nepali', 'Tharu']
      },
      {
        name: 'Anita Tharu',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Co-Host',
        bio: 'Anita manages the lodge and ensures every guest feels at home.',
        badges: ['Superhost'],
        languages: ['Nepali', 'Tharu']
      }
    ],
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ['WiFi', 'Safari Tours', 'Restaurant', 'Jungle View'],
    isVerified: true,
    instantBook: false,
    description: 'Located at the edge of Chitwan National Park, this eco-friendly lodge offers the perfect base for wildlife adventures. Experience Tharu culture and spot rhinos, tigers, and exotic birds.',
    latitude: 27.5823,
    longitude: 84.4983,
    createdAt: '2024-04-15T10:00:00Z'
  },
  {
    id: '5',
    title: 'Everest Gateway Mountain Lodge',
    location: 'Namche Bazaar',
    province: 'Province 1',
    price: 1140,
    priceNPR: 1140,
    priceUSD: 231,
    rating: 4.9,
    reviewCount: 94,
    images: [
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    hostName: 'Pemba Sherpa',
    hostAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    hosts: [
      {
        name: 'Pemba Sherpa',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Owner',
        bio: 'Pemba is a seasoned mountaineer and Sherpa guide who has summited Everest multiple times.',
        badges: ['Superhost', 'Verified'],
        languages: ['English', 'Nepali', 'Sherpa']
      },
      {
        name: 'Dawa Sherpa',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Co-Host',
        bio: 'Dawa helps guests acclimatize and shares stories of Sherpa culture.',
        badges: ['Local Expert'],
        languages: ['Nepali', 'Sherpa']
      }
    ],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['Mountain View', 'Heating', 'Sherpa Culture', 'Trekking Guide'],
    isVerified: true,
    instantBook: true,
    description: 'Gateway to Everest Base Camp! Stay with a local Sherpa family and learn about high-altitude mountain culture. Perfect acclimatization stop with stunning Himalayan views.',
    latitude: 27.8056,
    longitude: 86.7167,
    status: 'recommended',
    createdAt: '2024-07-01T10:00:00Z'
  },
  {
    id: '6',
    title: 'Heritage House in Patan',
    location: 'Patan',
    province: 'Bagmati',
    price: 550,
    priceNPR: 550,
    priceUSD: 38,
    rating: 4.8,
    reviewCount: 112,
    images: [
      'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2029670/pexels-photo-2029670.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1838630/pexels-photo-1838630.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    hostName: 'Sunita Maharjan',
    hostAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    hosts: [
      {
        name: 'Sunita Maharjan',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
        role: 'Owner',
        bio: 'Sunita is a master potter and heritage conservationist. She offers pottery workshops to guests.',
        badges: ['Verified'],
        languages: ['English', 'Nepali', 'Newari']
      }
    ],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['WiFi', 'Parking', 'Cultural Experience', 'Garden'],
    isVerified: true,
    instantBook: false,
    description: 'Stay in a meticulously restored Newari heritage house steps away from Patan Durbar Square. Experience traditional craftsmanship and enjoy handmade pottery workshops.',
    latitude: 27.6767,
    longitude: 85.3250,
    createdAt: '2024-03-01T10:00:00Z'
  }
]

export const mockReviews = [
  {
    id: '1',
    listingId: '1',
    guestName: 'Sarah Chen',
    guestAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    rating: 5,
    comment: 'Absolutely magical experience! Kamala and her family made us feel like part of the family. The traditional meals were incredible and learning about Newari culture was fascinating.',
    date: new Date('2024-01-15'),
    images: ['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=400']
  },
  {
    id: '2',
    listingId: '1',
    guestName: 'Mark Johnson',
    guestAvatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    rating: 5,
    comment: 'The location is perfect for exploring Bhaktapur. The house is beautifully maintained and full of character. Highly recommend!',
    date: new Date('2024-01-10'),
    images: []
  }
]

export const mockBookings = [
  {
    id: 'b1',
    listingId: '1',
    date: '2024-07-10',
    province: 'Bagmati',
    location: 'Bhaktapur',
    price: 1445,
  },
  {
    id: 'b2',
    listingId: '2',
    date: '2024-07-09',
    province: 'Gandaki',
    location: 'Pokhara',
    price: 2235,
  },
  {
    id: 'b3',
    listingId: '3',
    date: '2024-07-08',
    province: 'Gandaki',
    location: 'Ghandruk',
    price: 3425,
  },
  {
    id: 'b4',
    listingId: '1',
    date: '2024-07-07',
    province: 'Bagmati',
    location: 'Bhaktapur',
    price: 1445,
  },
  {
    id: 'b5',
    listingId: '4',
    date: '2024-07-06',
    province: 'Bagmati',
    location: 'Sauraha',
    price: 3355,
  },
  {
    id: 'b6',
    listingId: '5',
    date: '2024-07-05',
    province: 'Province 1',
    location: 'Namche Bazaar',
    price: 1140,
  },
  {
    id: 'b7',
    listingId: '6',
    date: '2024-07-04',
    province: 'Bagmati',
    location: 'Patan',
    price: 550,
  },
  {
    id: 'b8',
    listingId: '2',
    date: '2024-07-03',
    province: 'Gandaki',
    location: 'Pokhara',
    price: 2235,
  },
  {
    id: 'b9',
    listingId: '3',
    date: '2024-07-02',
    province: 'Gandaki',
    location: 'Ghandruk',
    price: 3425,
  },
  {
    id: 'b10',
    listingId: '1',
    date: '2024-07-01',
    province: 'Bagmati',
    location: 'Bhaktapur',
    price: 1445,
  },
];