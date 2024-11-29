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
  increment,
  arrayUnion,
  arrayRemove,
  getDoc,
  Timestamp
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'

// Extract hashtags from text
export const extractHashtags = (text) => {
  if (!text) return [];
  
  // Match both #word and plain words, excluding common punctuation
  const words = text.split(/[\s,.]/).filter(word => 
    word && 
    !word.includes('!') && 
    !word.includes('?') && 
    !word.includes(';') &&
    word !== '#'
  );

  return words.map(word => {
    // Remove # if it exists at the start and any trailing punctuation
    const cleanWord = word.startsWith('#') ? word.slice(1) : word;
    // Return word with # prefix if it's a valid tag (alphanumeric, no spaces)
    return cleanWord.match(/^[\w\u0590-\u05ff]+$/) ? `#${cleanWord}` : null;
  }).filter(Boolean); // Remove null values
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

export const updatePost = async (postId, updates) => {
  try {
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating post:', error)
    throw error
  }
}

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
        const storageRef = ref(storage, postData.mediaPath);
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

// Rate limiting configuration
const RATE_LIMITS = {
  comments: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
    store: new Map()
  }
};

const isRateLimited = (key, type = 'comments') => {
  const now = Date.now();
  const limit = RATE_LIMITS[type];
  const userKey = `${type}_${key}`;
  
  // Get or initialize user's request data
  const userData = limit.store.get(userKey) || { 
    count: 0, 
    resetAt: now + limit.windowMs 
  };
  
  // Reset if window has passed
  if (now >= userData.resetAt) {
    userData.count = 0;
    userData.resetAt = now + limit.windowMs;
  }
  
  // Check if limit exceeded
  if (userData.count >= limit.maxRequests) {
    const waitMinutes = Math.ceil((userData.resetAt - now) / (60 * 1000));
    throw new Error(`Rate limit exceeded. Please try again in ${waitMinutes} minutes.`);
  }
  
  // Update count and store
  userData.count++;
  limit.store.set(userKey, userData);
  return false;
};

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
    const postRef = doc(db, 'posts', postId)
    const postDoc = await getDoc(postRef)
    
    if (!postDoc.exists()) {
      throw new Error('Post not found')
    }

    await updateDoc(postRef, {
      comments: arrayRemove(commentToDelete),
      commentsCount: increment(-1)
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

// Like/Unlike a post
export const toggleLike = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    const postData = postDoc.data();
    
    // Check if user has already liked the post
    const likedBy = postData.likedBy || [];
    const isLiked = likedBy.includes(userId);
    
    await updateDoc(postRef, {
      likes: increment(isLiked ? -1 : 1),
      likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
    });

    return !isLiked;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error
  }
};
