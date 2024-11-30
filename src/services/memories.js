import { db, storage } from './firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, getDoc, startAfter } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetches memories for a specific user with pagination
 */
export const getMemories = async ({ userId, lastDoc = null, pageSize = 12 }) => {
  try {
    const memoriesRef = collection(db, 'memories');
    let q = query(
      memoriesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const memories = [];
    snapshot.forEach((doc) => {
      memories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      memories,
      lastVisible
    };
  } catch (error) {
    console.error('Error fetching memories:', error);
    throw error;
  }
};

/**
 * Creates a new memory with image upload
 */
export const createMemory = async ({ userId, title, description, image, date }) => {
  try {
    // Upload image to Storage
    const imageId = uuidv4();
    const imageRef = ref(storage, `memories/${userId}/${imageId}`);
    await uploadBytes(imageRef, image);
    const imageUrl = await getDownloadURL(imageRef);

    // Create memory document
    const memoriesRef = collection(db, 'memories');
    const newMemory = {
      userId,
      title,
      description,
      imageUrl,
      storagePath: `memories/${userId}/${imageId}`,
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      analysis: null
    };

    const docRef = await addDoc(memoriesRef, newMemory);
    return {
      id: docRef.id,
      ...newMemory
    };
  } catch (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
};

/**
 * Updates an existing memory
 */
export const updateMemory = async (memoryId, updates) => {
  try {
    const memoryRef = doc(db, 'memories', memoryId);
    await updateDoc(memoryRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await getDoc(memoryRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error('Error updating memory:', error);
    throw error;
  }
};

/**
 * Gets a single memory by ID
 */
export const getMemoryById = async (memoryId) => {
  try {
    const memoryRef = doc(db, 'memories', memoryId);
    const memoryDoc = await getDoc(memoryRef);
    
    if (!memoryDoc.exists()) {
      throw new Error('Memory not found');
    }

    return {
      id: memoryDoc.id,
      ...memoryDoc.data()
    };
  } catch (error) {
    console.error('Error fetching memory:', error);
    throw error;
  }
};

/**
 * Gets memories by date range
 */
export const getMemoriesByDateRange = async ({ userId, startDate, endDate }) => {
  try {
    const memoriesRef = collection(db, 'memories');
    const q = query(
      memoriesRef,
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    const memories = [];
    snapshot.forEach((doc) => {
      memories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return memories;
  } catch (error) {
    console.error('Error fetching memories by date range:', error);
    throw error;
  }
};

/**
 * Gets memories by tag
 */
export const getMemoriesByTag = async ({ userId, tag }) => {
  try {
    const memoriesRef = collection(db, 'memories');
    const q = query(
      memoriesRef,
      where('userId', '==', userId),
      where('tags', 'array-contains', tag),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const memories = [];
    snapshot.forEach((doc) => {
      memories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return memories;
  } catch (error) {
    console.error('Error fetching memories by tag:', error);
    throw error;
  }
};

/**
 * Gets memories with specific emotion
 */
export const getMemoriesByEmotion = async ({ userId, emotion }) => {
  try {
    const memoriesRef = collection(db, 'memories');
    const q = query(
      memoriesRef,
      where('userId', '==', userId),
      where('analysis.emotions', 'array-contains', emotion),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const memories = [];
    snapshot.forEach((doc) => {
      memories.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return memories;
  } catch (error) {
    console.error('Error fetching memories by emotion:', error);
    throw error;
  }
};
