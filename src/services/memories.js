import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { mockGetOnThisDayMemories } from './mockData';

const USE_MOCK_DATA = true; // Toggle this to switch between mock and real data

export const getOnThisDayMemories = async (userId) => {
  if (USE_MOCK_DATA) {
    return mockGetOnThisDayMemories(userId);
  }

  try {
    const today = new Date();
    const postsRef = collection(db, 'posts');
    
    // Create a query for posts from previous years on the same month and day
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    startOfDay.setFullYear(startOfDay.getFullYear() - 10); // Look back up to 10 years
    
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    endOfDay.setFullYear(endOfDay.getFullYear() - 1); // Only get memories at least 1 year old

    const q = query(
      postsRef,
      where('userId', '==', userId),
      where('timestamp', '>=', startOfDay),
      where('timestamp', '<=', endOfDay)
    );

    const querySnapshot = await getDocs(q);
    const memories = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const postDate = data.timestamp.toDate();
      const yearsAgo = today.getFullYear() - postDate.getFullYear();
      
      memories.push({
        id: doc.id,
        ...data,
        yearsAgo
      });
    });

    // Sort by most recent first
    return memories.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};
