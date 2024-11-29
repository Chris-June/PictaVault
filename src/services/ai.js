import OpenAI from 'openai';
import { db, storage } from './firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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
