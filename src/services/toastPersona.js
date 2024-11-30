// MemoryKeeper - An AI assistant personality for toast notifications
// Characteristics: Warm, caring, slightly quirky, and passionate about preserving memories

import OpenAI from 'openai';
import { getEnvironmentVariable } from './environment';

const openai = new OpenAI({
  apiKey: getEnvironmentVariable('VITE_OPENAI_API_KEY'),
  dangerouslyAllowBrowser: true
});

const PERSONA_TRAITS = {
  name: 'MemoryKeeper',
  characteristics: [
    'warm and friendly',
    'passionate about memories',
    'slightly quirky',
    'uses metaphors about memories, time, and preservation'
  ]
};

// Emotion-based emojis for different statuses
const STATUS_EMOTIONS = {
  success: ['✨', '🌟', '💫', '🎉', '💝', '🌈'],
  error: ['🔄', '🛠', '🔧', '🤔', '💭'],
  info: ['💡', '✨', '🎯', '💫'],
  warning: ['⚡', '🔔', '💭', '⚠️']
};

// Get a random element from an array
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

// Generate AI prompt based on action and status
const generatePrompt = (action, status, customContext = {}) => {
  const basePrompt = `You are MemoryKeeper, an AI assistant who helps manage digital memories. 
Your personality is warm, caring, and slightly quirky. You love using metaphors about memories, time, and preservation.

Generate a short, friendly message (maximum 100 characters) for a user who just ${action} ${customContext.itemType || 'a memory'}.
The action was ${status === 'error' ? 'unsuccessful' : 'successful'}.

The message should:
1. Be warm and encouraging
2. Include a memory or preservation metaphor
3. Be slightly quirky but professional
4. Not use markdown or formatting

Example successful messages:
- "Another precious moment safely tucked into my digital heart! ✨"
- "Memory beautifully preserved in the digital garden! 🌟"

Example error messages:
- "My memory circuits need a gentle reset! Shall we try again? 🔄"
- "A small hiccup in the digital preservation! Another try? 💫"`;

  return basePrompt;
};

// Generate message using OpenAI
const generateAIMessage = async (action, status, customContext = {}) => {
  try {
    const prompt = generatePrompt(action, status, customContext);
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 50,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI message:', error);
    // Fallback messages if AI generation fails
    return status === 'error' 
      ? "My circuits encountered a small hiccup! Shall we try again? 🔄"
      : "Memory processed successfully! ✨";
  }
};

// Create toast message with AI-generated content
export const createToastMessage = async (action, status, customContext = {}) => {
  const emotion = getRandomElement(STATUS_EMOTIONS[status] || STATUS_EMOTIONS.info);
  const description = await generateAIMessage(action, status, customContext);
  
  return {
    title: `${PERSONA_TRAITS.name} ${status === 'error' ? 'Error' : 'Update'} ${emotion}`,
    description,
    status,
    duration: 5000,
    isClosable: true,
    position: 'top-right',
    variant: 'solid',
  };
};
