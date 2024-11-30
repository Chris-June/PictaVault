import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { getStorage, ref, deleteObject } from 'firebase/storage'
import { extractHashtags } from '../utils/textUtils'

// Rate limiting configuration
const RATE_LIMITS = {
  comments: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50 // max requests per window
  }
};

// Rate limiting state
const rateLimitState = new Map();

// Check rate limit
const isRateLimited = (key, type = 'comments') => {
  const now = Date.now();
  const windowMs = RATE_LIMITS[type].windowMs;
  const maxRequests = RATE_LIMITS[type].maxRequests;
  
  // Get or initialize rate limit data for this key
  const limitData = rateLimitState.get(key) || {
    requests: [],
    blocked: false,
    blockedUntil: 0
  };
  
  // Clear old requests
  limitData.requests = limitData.requests.filter(
    time => now - time < windowMs
  );
  
  // Check if currently blocked
  if (limitData.blocked && now < limitData.blockedUntil) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((limitData.blockedUntil - now) / 1000)} seconds`);
  }
  
  // Check request count
  if (limitData.requests.length >= maxRequests) {
    limitData.blocked = true;
    limitData.blockedUntil = now + windowMs;
    rateLimitState.set(key, limitData);
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds`);
  }
  
  // Add new request
  limitData.requests.push(now);
  rateLimitState.set(key, limitData);
};

export const createPost = async ({ mediaUrl, caption, userId, mediaType, mediaPath }) => {
  try {
    const hashtags = extractHashtags(caption);
    const post = {
      mediaUrl,
      caption,
      userId,
      mediaType,
      mediaPath,
      likes: 0,
      comments: 0,
      likedBy: [],
      comments: [],
      hashtags, // Store extracted hashtags
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'posts'), post)
    return { id: docRef.id, ...post }
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

export const updatePost = async (updatedData) => {
  try {
    const postRef = doc(db, 'posts', updatedData.id);
    
    // Remove id from the data to be updated
    const { id, ...dataToUpdate } = updatedData;
    
    // Add timestamp
    const data = {
      ...dataToUpdate,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(postRef, data);
    return true;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    // Get the post data first
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    const postData = postSnap.data();
    
    // Delete the media from storage if it exists
    if (postData.mediaPath) {
      try {
        const storageRef = ref(getStorage(), postData.mediaPath);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.error('Error deleting media from storage:', storageError);
        // Continue with post deletion even if storage deletion fails
      }
    }

    // Delete the post document
    await deleteDoc(postRef);

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export const getAllPosts = async (options = {}) => {
  try {
    let q = collection(db, 'posts')
    const constraints = []

    if (options.sortBy) {
      switch (options.sortBy) {
        case 'newest':
          constraints.push(orderBy('createdAt', 'desc'))
          break
        case 'oldest':
          constraints.push(orderBy('createdAt', 'asc'))
          break
        case 'mostLiked':
          constraints.push(orderBy('likes', 'desc'))
          break
        case 'leastLiked':
          constraints.push(orderBy('likes', 'asc'))
          break
      }
    }

    if (options.searchQuery) {
      if (options.searchQuery.startsWith('#')) {
        const hashtagQuery = options.searchQuery.slice(1).toLowerCase();
        constraints.push(where('hashtags', 'array-contains', '#' + hashtagQuery));
      } else {
        constraints.push(where('caption', '>=', options.searchQuery));
        constraints.push(where('caption', '<=', options.searchQuery + '\uf8ff'));
      }
    }

    if (options.limit) {
      constraints.push(limit(options.limit))
    }

    q = query(q, ...constraints)
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Format comments
      const comments = Array.isArray(data.comments) 
        ? data.comments.map(comment => ({
            id: comment.id || '',
            text: comment.text || '',
            userId: comment.userId || '',
            userName: comment.userName || 'Anonymous',
            userPhotoURL: comment.userPhotoURL || '',
            createdAt: comment.createdAt 
              ? (typeof comment.createdAt?.toDate === 'function'
                ? comment.createdAt.toDate()
                : new Date(comment.createdAt))
              : new Date()
          }))
        : [];

      // Ensure numeric fields are properly initialized
      const likes = typeof data.likes === 'number' ? data.likes : 0;
      const commentCount = typeof data.comments === 'number' ? data.comments : comments.length;

      // Format timestamps
      const createdAt = data.createdAt 
        ? (typeof data.createdAt?.toDate === 'function'
          ? data.createdAt.toDate()
          : new Date(data.createdAt))
        : new Date();

      const updatedAt = data.updatedAt
        ? (typeof data.updatedAt?.toDate === 'function'
          ? data.updatedAt.toDate()
          : new Date(data.updatedAt))
        : createdAt;

      return {
        id: doc.id,
        ...data,
        comments,
        likes,
        commentCount,
        createdAt,
        updatedAt
      };
    });
  } catch (error) {
    console.error('Error getting posts:', error)
    throw error
  }
}

// Get comments for a post
export const getPostComments = async (postId) => {
  try {
    // Check rate limit
    isRateLimited(postId);
    
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const post = postDoc.data();
    if (!post.comments || !Array.isArray(post.comments)) {
      return [];
    }

    // Serialize comments to ensure clean, primitive objects
    return post.comments.map(comment => ({
      id: comment.id ? String(comment.id) : String(Date.now()),
      text: comment.text ? String(comment.text) : '',
      userId: comment.userId ? String(comment.userId) : '',
      userName: comment.userName ? String(comment.userName) : 'Anonymous',
      userPhotoURL: comment.userPhotoURL ? String(comment.userPhotoURL) : '',
      createdAt: comment.createdAt 
        ? (comment.createdAt instanceof Timestamp 
          ? comment.createdAt.toDate()
          : new Date(comment.createdAt))
        : new Date()
    }));
  } catch (error) {
    console.error('Error getting comments:', error);
    
    if (error.message.includes('Rate limit exceeded')) {
      console.warn('Rate limit reached for comments:', error.message);
      return [];
    }
    
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId, commentData) => {
  try {
    // Check rate limit
    isRateLimited(`${postId}_${commentData.userId}`);
    
    if (!commentData.text?.trim()) {
      throw new Error('Comment text is required');
    }

    const comment = {
      id: String(Date.now()),
      text: String(commentData.text.trim()),
      userId: String(commentData.userId),
      userName: String(commentData.userName || 'Anonymous'),
      userPhotoURL: String(commentData.userPhotoURL || ''),
      createdAt: Timestamp.fromDate(new Date())
    };

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion(comment),
      updatedAt: serverTimestamp()
    });

    return {
      ...comment,
      createdAt: comment.createdAt.toDate()
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Delete a comment from a post
export const deleteComment = async (postId, commentToDelete) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    await updateDoc(postRef, {
      comments: arrayRemove(commentToDelete),
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Like/Unlike a post
export const toggleLike = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const post = postDoc.data();
    const likes = post.likes || [];
    const isLiked = likes.includes(userId);

    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
      updatedAt: serverTimestamp()
    });

    return !isLiked;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};
