import OpenAI from 'openai';
import { db, storage } from './firebase';
import { collection, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Categories for photo organization
export const PHOTO_CATEGORIES = {
  EVENTS: ['wedding', 'birthday', 'graduation', 'holiday', 'travel', 'party', 'ceremony'],
  PEOPLE: ['family', 'friends', 'children', 'group', 'portrait', 'selfie'],
  PLACES: ['indoor', 'outdoor', 'nature', 'urban', 'beach', 'mountain', 'landmark'],
  ACTIVITIES: ['sports', 'dining', 'shopping', 'exercise', 'gaming', 'reading', 'cooking'],
  EMOTIONS: ['happy', 'excited', 'peaceful', 'romantic', 'nostalgic', 'proud'],
  TIME_OF_DAY: ['sunrise', 'daytime', 'sunset', 'night'],
  SEASONS: ['spring', 'summer', 'fall', 'winter'],
  OCCASIONS: ['casual', 'formal', 'celebration', 'work', 'vacation']
};

/**
 * Analyzes a photo using OpenAI's Vision model to generate tags and categories
 */
export const analyzePhoto = async (imageUrl, existingMetadata = {}) => {
  try {
    // Prepare the prompt for comprehensive photo analysis
    const systemPrompt = `Analyze this image and provide detailed information in the following format:
    {
      "description": "A brief, natural description of the image",
      "categories": {
        "events": ["List of relevant event types"],
        "people": ["Types of people or relationships shown"],
        "places": ["Types of locations or settings"],
        "activities": ["Actions or activities happening"],
        "emotions": ["Emotional tones present"],
        "timeOfDay": ["Time of day if apparent"],
        "seasons": ["Season if apparent"],
        "occasions": ["Type of occasion"]
      },
      "tags": ["All relevant tags", "including specific details", "max 10 tags"],
      "mainElements": ["Key objects", "or subjects", "in the image", "max 5 elements"],
      "technicalDetails": {
        "shotType": "close-up/medium/wide",
        "lighting": "natural/artificial/mixed",
        "setting": "indoor/outdoor",
        "composition": "Brief note about image composition"
      }
    }`;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image in detail:" },
            { type: "image_url", url: imageUrl }
          ],
        },
      ],
      max_tokens: 500,
    });

    // Parse the response
    const analysis = JSON.parse(response.choices[0].message.content);

    // Merge with existing metadata if any
    return {
      ...existingMetadata,
      ...analysis,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error analyzing photo:', error);
    throw error;
  }
};

/**
 * Updates a photo's metadata in Firestore with analysis results
 */
export const updatePhotoMetadata = async (photoId, metadata) => {
  try {
    const photoRef = doc(db, 'posts', photoId);
    await updateDoc(photoRef, {
      analysis: metadata,
      tags: arrayUnion(...metadata.tags),
      categories: metadata.categories,
    });
    return true;
  } catch (error) {
    console.error('Error updating photo metadata:', error);
    throw error;
  }
};

/**
 * Analyzes a batch of photos and updates their metadata
 */
export const batchAnalyzePhotos = async (photos) => {
  const results = [];
  for (const photo of photos) {
    try {
      // Get the download URL if we have a storage path
      const imageUrl = photo.imageUrl || await getDownloadURL(ref(storage, photo.storagePath));
      
      // Analyze the photo
      const analysis = await analyzePhoto(imageUrl, photo.analysis);
      
      // Update the metadata in Firestore
      await updatePhotoMetadata(photo.id, analysis);
      
      results.push({
        id: photo.id,
        success: true,
        analysis
      });
    } catch (error) {
      console.error(`Error processing photo ${photo.id}:`, error);
      results.push({
        id: photo.id,
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

/**
 * Gets photos by category and tags
 */
export const getPhotosByCategory = async (userId, category, tags = []) => {
  try {
    const photosRef = collection(db, 'posts');
    let query = photosRef.where('userId', '==', userId);
    
    if (category) {
      query = query.where('categories.' + category, 'array-contains-any', tags);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting photos by category:', error);
    throw error;
  }
};
