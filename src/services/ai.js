import OpenAI from 'openai';
import { db, storage } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  limit, 
  getDocs, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Helper function to convert image URL to base64
async function getImageAsBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

export const analyzeImage = async (imageUrl, prompt = '') => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: prompt || `Analyze this image and provide a structured response in the following format:

Scene: [Brief description of the overall scene]
Main Elements: [Key objects, people, or focal points]
Action/Activity: [What's happening in the image]
Mood/Atmosphere: [The emotional tone or ambiance]
Colors & Lighting: [Description of the color palette and lighting]
Notable Details: [Any interesting or unique details]

Please provide the analysis in exactly this format with these headings.`
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    // Parse the structured response
    const analysisText = response.choices[0].message.content;
    const sections = {};
    
    const sectionRegex = /^([^:]+):\s*(.+)$/gm;
    let match;
    
    while ((match = sectionRegex.exec(analysisText)) !== null) {
      sections[match[1].trim()] = match[2].trim();
    }

    return sections;
  } catch (error) {
    console.error('Error analyzing image:', error);
    if (error.message.includes('API key')) {
      throw new Error('Invalid API key configuration. Please check your environment variables.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error while connecting to OpenAI. Please check your internet connection.');
    }
    throw error;
  }
};

export const generateImageTags = async (imageUrl) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Generate relevant tags for this image. Focus on objects, scenes, activities, emotions, and style. Return only the tags separated by commas, without any additional text or explanation."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return response.choices[0].message.content.split(',').map(tag => tag.trim());
  } catch (error) {
    console.error('Error generating tags:', error);
    throw error;
  }
};

export const saveImageAnalysis = async (imageId, analysis) => {
  try {
    const analysisRef = collection(db, 'imageAnalysis');
    await addDoc(analysisRef, {
      imageId,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving image analysis:', error);
    throw error;
  }
};

export const generateImageCaption = async (imageUrl) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Generate a creative and engaging caption for this image. Make it concise but descriptive." },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating caption:', error);
    throw error;
  }
};

export const suggestCollections = async (imageUrl) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Suggest 3-5 collection names that this image could belong to. Consider the theme, style, and content of the image. Return only the collection names separated by commas, without any additional text." },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return response.choices[0].message.content.split(',').map(suggestion => suggestion.trim());
  } catch (error) {
    console.error('Error suggesting collections:', error);
    throw error;
  }
};

export const findSimilarImages = async (postId, maxResults = 5) => {
  try {
    // Get the current post's tags
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const currentPost = postDoc.data();
    const tags = currentPost.tags || [];

    if (tags.length === 0) {
      return [];
    }

    // Query posts with similar tags, excluding the current post
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('tags', 'array-contains-any', tags),
      limit(maxResults + 1) // Add 1 to account for filtering out current post
    );

    const querySnapshot = await getDocs(q);
    
    // Map and filter out the current post
    const similarPosts = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(post => post.id !== postId)
      .slice(0, maxResults);

    return similarPosts;
  } catch (error) {
    console.error('Error finding similar images:', error);
    throw error;
  }
};

export const generateAIArt = async (imageUrl) => {
  try {
    // Generate a creative prompt for the image using GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Describe this image in a way that would make a great prompt for an AI art generator. Focus on style, mood, and artistic elements. Make it creative and detailed but concise." 
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    const prompt = response.choices[0].message.content;

    // Generate new image using DALL-E 3
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    if (!imageResponse.data?.[0]?.url) {
      throw new Error('Invalid response from OpenAI API');
    }

    return imageResponse.data[0].url;
  } catch (error) {
    console.error('Error generating AI art:', error);
    if (error.message.includes('API key')) {
      throw new Error('Invalid API key configuration. Please check your environment variables.');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error while connecting to OpenAI. Please check your internet connection.');
    }
    throw error;
  }
};

export const autoGenerateAlbum = async (userId) => {
  try {
    // Get all user's posts
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    // Initialize album suggestions with metadata
    const albumSuggestions = {};
    
    // Process each post
    querySnapshot.forEach(doc => {
      const post = { id: doc.id, ...doc.data() };
      const tags = post.tags || [];
      
      // Group by tags
      tags.forEach(tag => {
        // Normalize tag to use as key
        const normalizedTag = tag.toLowerCase().trim();
        if (!albumSuggestions[normalizedTag]) {
          albumSuggestions[normalizedTag] = {
            name: tag, // Keep original tag for display
            description: `Auto-generated album for ${tag}`,
            posts: [],
            count: 0,
            createdAt: serverTimestamp(),
            previewImage: null
          };
        }
        
        albumSuggestions[normalizedTag].posts.push(post);
        albumSuggestions[normalizedTag].count++;
        
        // Use the first image as preview if not set
        if (!albumSuggestions[normalizedTag].previewImage && post.mediaUrl) {
          albumSuggestions[normalizedTag].previewImage = post.mediaUrl;
        }
      });
    });

    // Filter out albums with too few items (e.g., less than 3)
    const MIN_ALBUM_SIZE = 3;
    const filteredAlbums = Object.entries(albumSuggestions)
      .filter(([_, album]) => album.count >= MIN_ALBUM_SIZE)
      .reduce((acc, [key, album]) => {
        acc[key] = album;
        return acc;
      }, {});

    return filteredAlbums;
  } catch (error) {
    console.error('Error auto-generating albums:', error);
    throw error;
  }
};

export const createAutoGeneratedAlbum = async (userId, albumData) => {
  try {
    // Create the album document
    const albumRef = await addDoc(collection(db, 'collections'), {
      userId,
      name: albumData.name,
      description: albumData.description,
      isAutoGenerated: true,
      createdAt: serverTimestamp(),
      previewImage: albumData.previewImage,
      postCount: albumData.count,
      isPrivate: false
    });

    // Add posts to the album
    const promises = albumData.posts.map(post => 
      addDoc(collection(db, 'collection_items'), {
        collectionId: albumRef.id,
        postId: post.id,
        addedAt: serverTimestamp()
      })
    );

    await Promise.all(promises);

    return albumRef.id;
  } catch (error) {
    console.error('Error creating auto-generated album:', error);
    throw error;
  }
};
