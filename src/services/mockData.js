// Mock data for testing memories feature
export const mockMemories = [
  {
    id: 'mem1',
    imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba',
    caption: 'Family reunion at the beach',
    timestamp: {
      toDate: () => new Date(2022, 11, 15) // December 15, 2022
    },
    yearsAgo: 1,
    userId: 'user123',
    tags: ['family', 'beach', 'sunset', 'happiness'],
    analysis: {
      scene: 'Beach sunset gathering',
      mainElements: 'Family members, ocean waves, golden sunset',
      mood: 'Joyful and nostalgic',
      colors: 'Warm oranges and blues',
      action: 'Group celebration'
    }
  },
  {
    id: 'mem2',
    imageUrl: 'https://images.unsplash.com/photo-1682687221038-404670f09561',
    caption: 'First day at college',
    timestamp: {
      toDate: () => new Date(2021, 11, 15) // December 15, 2021
    },
    yearsAgo: 2,
    userId: 'user123',
    tags: ['education', 'milestone', 'campus', 'beginnings'],
    analysis: {
      scene: 'University campus',
      mainElements: 'College building, students, autumn trees',
      mood: 'Excited and hopeful',
      colors: 'Rich autumn colors',
      action: 'Starting new chapter'
    }
  },
  {
    id: 'mem3',
    imageUrl: 'https://images.unsplash.com/photo-1682687220015-4f96361c7206',
    caption: 'Hiking adventure in the mountains',
    timestamp: {
      toDate: () => new Date(2020, 11, 15) // December 15, 2020
    },
    yearsAgo: 3,
    userId: 'user123',
    tags: ['hiking', 'adventure', 'nature', 'mountains'],
    analysis: {
      scene: 'Mountain summit',
      mainElements: 'Mountain peaks, hiking gear, clouds',
      mood: 'Accomplished and peaceful',
      colors: 'Earth tones and sky blue',
      action: 'Mountain climbing'
    }
  }
];

export const mockChatHistory = {
  'mem1': [
    {
      content: "I see this photo from 1 year ago! Would you like to tell me more about this beach sunset gathering? The joy in this family reunion looks incredible!",
      isUser: false,
      timestamp: "2023-12-15T10:00:00.000Z"
    },
    {
      content: "It was such a special day! We hadn't all been together in years, and my cousin surprised us by flying in from Australia.",
      isUser: true,
      timestamp: "2023-12-15T10:01:00.000Z"
    },
    {
      content: "That must have been an amazing surprise! The sunset in the photo creates such a beautiful backdrop. What was your favorite moment from that reunion?",
      isUser: false,
      timestamp: "2023-12-15T10:02:00.000Z"
    }
  ],
  'mem2': [
    {
      content: "This photo from your first day at college brings back memories from 2 years ago! The campus looks beautiful with those autumn trees. How were you feeling that day?",
      isUser: false,
      timestamp: "2023-12-15T11:00:00.000Z"
    }
  ],
  'mem3': [
    {
      content: "What an achievement reaching that summit 3 years ago! The view looks absolutely breathtaking. Was this your first major hiking expedition?",
      isUser: false,
      timestamp: "2023-12-15T12:00:00.000Z"
    }
  ]
};

// Mock function to simulate delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock memory service functions
export const mockGetOnThisDayMemories = async (userId) => {
  await delay(1000); // Simulate network delay
  return mockMemories;
};

export const mockGetMemoryChatHistory = async (memoryId, userId) => {
  await delay(500);
  return mockChatHistory[memoryId] || [];
};

export const mockGenerateMemoryResponse = async (memory, messages, userMessage) => {
  await delay(1500);
  const responses = [
    "That's such a meaningful memory! What other details do you remember from that day?",
    "I can see why this moment was special to you. How did this experience change you?",
    "The emotions in this photo are beautiful. Would you like to share more about how you were feeling?",
    "What a wonderful story! Did this moment lead to any new traditions or habits?",
    "I love how you described that. Were there any unexpected moments that made this memory even more special?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const mockSaveMemoryChat = async (memoryId, userId, messages) => {
  await delay(300);
  // In a real implementation, this would save to Firebase
  console.log('Saving chat history:', { memoryId, userId, messages });
  return true;
};
