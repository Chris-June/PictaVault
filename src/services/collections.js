import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  getDoc
} from 'firebase/firestore'
import { db } from './firebase'

// Create a new collection/album
export const createCollection = async ({ name, description, userId, isPrivate = false }) => {
  try {
    const collectionData = {
      name,
      description,
      userId,
      isPrivate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      mediaCount: 0,
      coverImage: null
    }
    
    const docRef = await addDoc(collection(db, 'collections'), collectionData)
    return { id: docRef.id, ...collectionData }
  } catch (error) {
    console.error('Error creating collection:', error)
    throw error
  }
}

// Get user's collections with pagination
export const getUserCollections = async ({ userId, lastDoc = null, pageSize = 12 }) => {
  try {
    let q = query(
      collection(db, 'collections'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(pageSize)
    )

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const querySnapshot = await getDocs(q)
    const collections = []
    let lastVisible = null

    querySnapshot.forEach((doc) => {
      collections.push({ id: doc.id, ...doc.data() })
      lastVisible = doc
    })

    return { collections, lastVisible }
  } catch (error) {
    console.error('Error getting collections:', error)
    throw error
  }
}

// Add media to collection
export const addToCollection = async (collectionId, mediaId) => {
  try {
    const collectionRef = doc(db, 'collections', collectionId)
    const mediaRef = doc(db, 'posts', mediaId)

    // Verify both documents exist
    const [collectionDoc, mediaDoc] = await Promise.all([
      getDoc(collectionRef),
      getDoc(mediaRef)
    ])

    if (!collectionDoc.exists() || !mediaDoc.exists()) {
      throw new Error('Collection or media not found')
    }

    // Create collection-media relationship
    await addDoc(collection(db, 'collection_media'), {
      collectionId,
      mediaId,
      addedAt: serverTimestamp()
    })

    // Update collection metadata
    await updateDoc(collectionRef, {
      mediaCount: increment(1),
      updatedAt: serverTimestamp(),
      coverImage: mediaDoc.data().mediaUrl // Update cover with latest media
    })

    return true
  } catch (error) {
    console.error('Error adding to collection:', error)
    throw error
  }
}

// Get media in collection with infinite scroll
export const getCollectionMedia = async ({ collectionId, lastDoc = null, pageSize = 20 }) => {
  try {
    let q = query(
      collection(db, 'collection_media'),
      where('collectionId', '==', collectionId),
      orderBy('addedAt', 'desc'),
      limit(pageSize)
    )

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const querySnapshot = await getDocs(q)
    const mediaIds = []
    let lastVisible = null

    querySnapshot.forEach((doc) => {
      mediaIds.push(doc.data().mediaId)
      lastVisible = doc
    })

    // Get full media details
    const mediaPromises = mediaIds.map(id => getDoc(doc(db, 'posts', id)))
    const mediaSnapshots = await Promise.all(mediaPromises)
    
    const media = mediaSnapshots
      .filter(doc => doc.exists())
      .map(doc => ({ id: doc.id, ...doc.data() }))

    return { media, lastVisible }
  } catch (error) {
    console.error('Error getting collection media:', error)
    throw error
  }
}

// Remove media from collection
export const removeFromCollection = async (collectionId, mediaId) => {
  try {
    const q = query(
      collection(db, 'collection_media'),
      where('collectionId', '==', collectionId),
      where('mediaId', '==', mediaId),
      limit(1)
    )

    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      throw new Error('Media not found in collection')
    }

    // Delete the relationship document
    await deleteDoc(querySnapshot.docs[0].ref)

    // Update collection metadata
    const collectionRef = doc(db, 'collections', collectionId)
    await updateDoc(collectionRef, {
      mediaCount: increment(-1),
      updatedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error removing from collection:', error)
    throw error
  }
}

// Update collection details
export const updateCollection = async (collectionId, updates) => {
  try {
    const collectionRef = doc(db, 'collections', collectionId)
    await updateDoc(collectionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('Error updating collection:', error)
    throw error
  }
}

// Delete collection and all its media relationships
export const deleteCollection = async (collectionId) => {
  try {
    // Delete all media relationships
    const q = query(
      collection(db, 'collection_media'),
      where('collectionId', '==', collectionId)
    )
    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // Delete the collection document
    await deleteDoc(doc(db, 'collections', collectionId))
    return true
  } catch (error) {
    console.error('Error deleting collection:', error)
    throw error
  }
}
