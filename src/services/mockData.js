// Mock data for testing UI components and features
export const USE_MOCK_DATA = {
  photos: true,
  analysis: true,
  collections: true
};

// Sample image URLs from Unsplash for testing
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba', // Family gathering
  'https://images.unsplash.com/photo-1682687220063-4742bd7c8f1b', // Beach vacation
  'https://images.unsplash.com/photo-1682687220198-88e9bdea9931', // Birthday party
  'https://images.unsplash.com/photo-1682687220015-6c39e1d17539', // Hiking
  'https://images.unsplash.com/photo-1682687220795-796d3f6f7000', // City trip
  'https://images.unsplash.com/photo-1682687220509-61b8a906ca19', // Wedding
  'https://images.unsplash.com/photo-1682687220923-c58b9a4592ae', // Graduation
  'https://images.unsplash.com/photo-1682687220801-eef6a92d7990', // Holiday celebration
];

// Generate a random date within the last 5 years
const getRandomDate = () => {
  const end = new Date();
  const start = new Date(new Date().setFullYear(end.getFullYear() - 5));
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Sample photo metadata
export const MOCK_PHOTOS = [
  {
    id: 'photo1',
    imageUrl: SAMPLE_IMAGES[0],
    userId: 'testUser123',
    createdAt: getRandomDate(),
    caption: 'Family reunion at Grandma's house',
    analysis: {
      description: 'A large family gathering in a cozy living room with multiple generations present',
      categories: {
        events: ['family gathering', 'reunion'],
        people: ['family', 'group', 'multi-generation'],
        places: ['indoor', 'home'],
        activities: ['socializing', 'dining'],
        emotions: ['happy', 'nostalgic'],
        timeOfDay: ['daytime'],
        seasons: ['winter'],
        occasions: ['celebration']
      },
      tags: ['family', 'reunion', 'home', 'gathering', 'celebration', 'generations', 'living room'],
      mainElements: ['people', 'couch', 'decorations', 'food', 'gifts'],
      technicalDetails: {
        shotType: 'wide',
        lighting: 'natural',
        setting: 'indoor',
        composition: 'Group arrangement with central focus'
      }
    }
  },
  {
    id: 'photo2',
    imageUrl: SAMPLE_IMAGES[1],
    userId: 'testUser123',
    createdAt: getRandomDate(),
    caption: 'Summer beach vacation in Hawaii',
    analysis: {
      description: 'Beautiful beach sunset with palm trees and ocean waves',
      categories: {
        events: ['vacation', 'travel'],
        people: [],
        places: ['outdoor', 'beach', 'nature'],
        activities: ['relaxation'],
        emotions: ['peaceful', 'happy'],
        timeOfDay: ['sunset'],
        seasons: ['summer'],
        occasions: ['vacation']
      },
      tags: ['beach', 'sunset', 'ocean', 'vacation', 'hawaii', 'palm trees', 'waves'],
      mainElements: ['ocean', 'beach', 'palm trees', 'sunset', 'waves'],
      technicalDetails: {
        shotType: 'wide',
        lighting: 'natural',
        setting: 'outdoor',
        composition: 'Rule of thirds with horizon line'
      }
    }
  },
  {
    id: 'photo3',
    imageUrl: SAMPLE_IMAGES[2],
    userId: 'testUser123',
    createdAt: getRandomDate(),
    caption: 'Sarah's 30th Birthday Party',
    analysis: {
      description: 'Lively birthday party with decorations and cake',
      categories: {
        events: ['birthday', 'party'],
        people: ['friends', 'group'],
        places: ['indoor'],
        activities: ['celebration', 'party'],
        emotions: ['happy', 'excited'],
        timeOfDay: ['night'],
        seasons: ['spring'],
        occasions: ['celebration']
      },
      tags: ['birthday', 'party', 'cake', 'celebration', 'friends', 'decorations', '30th'],
      mainElements: ['cake', 'people', 'decorations', 'gifts', 'balloons'],
      technicalDetails: {
        shotType: 'medium',
        lighting: 'artificial',
        setting: 'indoor',
        composition: 'Centered composition with party elements'
      }
    }
  },
  {
    id: 'photo4',
    imageUrl: SAMPLE_IMAGES[3],
    userId: 'testUser123',
    createdAt: getRandomDate(),
    caption: 'Mountain hiking adventure',
    analysis: {
      description: 'Group hiking on a scenic mountain trail',
      categories: {
        events: ['travel', 'adventure'],
        people: ['friends', 'group'],
        places: ['outdoor', 'mountain', 'nature'],
        activities: ['hiking', 'sports'],
        emotions: ['excited', 'peaceful'],
        timeOfDay: ['daytime'],
        seasons: ['summer'],
        occasions: ['casual']
      },
      tags: ['hiking', 'mountains', 'adventure', 'nature', 'outdoors', 'friends', 'trail'],
      mainElements: ['mountains', 'people', 'trail', 'backpacks', 'sky'],
      technicalDetails: {
        shotType: 'wide',
        lighting: 'natural',
        setting: 'outdoor',
        composition: 'Leading lines with trail'
      }
    }
  },
  {
    id: 'photo5',
    imageUrl: SAMPLE_IMAGES[4],
    userId: 'testUser123',
    createdAt: getRandomDate(),
    caption: 'New York City weekend getaway',
    analysis: {
      description: 'Urban exploration in New York City with skyline view',
      categories: {
        events: ['travel'],
        people: [],
        places: ['urban', 'outdoor'],
        activities: ['sightseeing'],
        emotions: ['excited'],
        timeOfDay: ['daytime'],
        seasons: ['fall'],
        occasions: ['vacation']
      },
      tags: ['nyc', 'travel', 'city', 'urban', 'architecture', 'skyline', 'exploration'],
      mainElements: ['buildings', 'skyline', 'street', 'cars', 'people'],
      technicalDetails: {
        shotType: 'wide',
        lighting: 'natural',
        setting: 'outdoor',
        composition: 'Urban landscape with vertical lines'
      }
    }
  }
];

// Mock collections data
export const MOCK_COLLECTIONS = {
  events: [
    { name: 'Family Gatherings', count: 15 },
    { name: 'Vacations', count: 8 },
    { name: 'Birthdays', count: 12 },
    { name: 'Weddings', count: 3 }
  ],
  places: [
    { name: 'Beach', count: 25 },
    { name: 'Mountains', count: 15 },
    { name: 'Cities', count: 30 },
    { name: 'Home', count: 45 }
  ],
  people: [
    { name: 'Family', count: 50 },
    { name: 'Friends', count: 35 },
    { name: 'Pets', count: 10 }
  ],
  seasons: [
    { name: 'Summer', count: 40 },
    { name: 'Fall', count: 25 },
    { name: 'Winter', count: 20 },
    { name: 'Spring', count: 30 }
  ]
};

// Mock function to simulate API delay
export const mockDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock photo fetching function
export const getMockPhotos = async (category = null, tags = []) => {
  await mockDelay();
  
  if (!category && tags.length === 0) {
    return MOCK_PHOTOS;
  }
  
  return MOCK_PHOTOS.filter(photo => {
    if (category && !photo.analysis.categories[category.toLowerCase()]) {
      return false;
    }
    
    if (tags.length > 0) {
      return tags.every(tag => 
        photo.analysis.tags.includes(tag.toLowerCase()) ||
        Object.values(photo.analysis.categories)
          .flat()
          .includes(tag.toLowerCase())
      );
    }
    
    return true;
  });
};

// Mock collection fetching function
export const getMockCollections = async () => {
  await mockDelay();
  return MOCK_COLLECTIONS;
};
