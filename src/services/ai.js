import OpenAI from 'openai';
import { db, storage } from './firebase';
import { collection, addDoc, updateDoc, doc, query, where, limit, getDocs, getDoc } from 'firebase/firestore';
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
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: prompt || "Analyze this image in detail. Describe the scene, objects, people, activities, emotions, and any notable elements." 
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

    return response.choices[0].message.content;
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
    const analysis = await analyzeImage(imageUrl, 'Generate relevant tags for this image. Return them as a comma-separated list.');
    return analysis.split(',').map(tag => tag.trim());
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
    return await analyzeImage(imageUrl, 'Generate a concise, engaging caption for this image.');
  } catch (error) {
    console.error('Error generating caption:', error);
    throw error;
  }
};

export const suggestCollections = async (imageUrl) => {
  try {
    const suggestions = await analyzeImage(imageUrl, 'Suggest appropriate collection names for this image based on its content. Return them as a comma-separated list.');
    return suggestions.split(',').map(suggestion => suggestion.trim());
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
    // First, get the image content
    const base64Image = await getImageAsBase64(imageUrl);

    // Generate variations using OpenAI's API
    const response = await openai.images.createVariation({
      image: base64Image,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    if (!response.data?.[0]?.url) {
      throw new Error('Invalid response from OpenAI API');
    }

    return response.data[0].url;
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
