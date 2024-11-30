import OpenAI from 'openai'

// IMPORTANT: DO NOT CHANGE THE MODEL TYPE
// This service is specifically designed to work with gpt-4o-mini
// Changing the model may break functionality or exceed rate limits
const MODEL_TYPE = 'gpt-4o-mini'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

/**
 * Converts an image file to a base64 data URL
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} Base64 data URL of the image
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Generates multiple caption suggestions using gpt-4o-mini
 * @param {string} imageDescription - Brief description of the image content
 * @returns {Promise<string[]>} Array of caption suggestions
 */
export const generateCaptions = async (imageDescription) => {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_TYPE, // DO NOT CHANGE: Using gpt-4o-mini model
      messages: [
        {
          role: "system",
          content: "You are a creative social media caption writer. Generate engaging, diverse captions that capture the essence of photos."
        },
        {
          role: "user",
          content: `Generate 4 creative and engaging Instagram-style captions for this photo description: "${imageDescription}". Make them diverse in style:
          1. A descriptive caption
          2. A witty/playful caption
          3. A poetic/artistic caption
          4. An emoji-rich casual caption
          Keep each caption under 150 characters. Return only the captions, separated by newlines.`
        }
      ],
      max_tokens: 300,
      temperature: 0.8,
    })

    // Split the response into individual captions
    const captions = response.choices[0].message.content
      .split('\n')
      .filter(caption => caption.trim().length > 0)

    return captions
  } catch (error) {
    console.error('Error generating captions:', error)
    throw new Error(error.message || 'Failed to generate captions')
  }
}

/**
 * Generates a single optimized caption
 * @param {string} imageDescription - Brief description of the image content
 * @returns {Promise<string>} The generated caption
 */
export const generateSingleCaption = async (imageDescription) => {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL_TYPE, // DO NOT CHANGE: Using gpt-4o-mini model
      messages: [
        {
          role: "system",
          content: "You are a creative social media caption writer."
        },
        {
          role: "user",
          content: `Generate a single engaging caption with relevant emojis for this photo description: "${imageDescription}". Keep it under 150 characters.`
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    })

    return response.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating caption:', error)
    throw new Error(error.message || 'Failed to generate caption')
  }
}
