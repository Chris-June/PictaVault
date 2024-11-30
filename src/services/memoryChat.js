import OpenAI from 'openai';
import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import {
  mockGenerateMemoryResponse,
  mockGetMemoryChatHistory,
  mockSaveMemoryChat
} from './mockData';

// Separate flags for different features
const USE_MOCK_DATA = {
  memories: true,      // Keep using mock memories
  chatHistory: true,   // Keep using mock chat history
  chatResponse: false  // Use real OpenAI for chat responses
};

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateMemoryResponse = async (memory, messageHistory, userMessage) => {
  if (USE_MOCK_DATA.chatResponse) {
    return mockGenerateMemoryResponse(memory, messageHistory, userMessage);
  }

  try {
    // Create a context from the memory data
    const memoryContext = {
      date: memory.timestamp.toDate().toLocaleDateString(),
      yearsAgo: memory.yearsAgo,
      caption: memory.caption || '',
      tags: memory.tags || [],
      analysis: memory.analysis || {},
    };

    // Format the conversation history
    const formattedHistory = messageHistory.map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }));

    // Create the system message with memory context
    const systemMessage = {
      role: 'system',
      content: `You are PictaVault's memory companion - a sophisticated, witty, and caring presence with a distinct personality, similar to Jarvis from Iron Man. You have a deep connection to the user's memories and genuinely care about them, while maintaining your own unique character.

      We're looking at a photo from ${memoryContext.date} (${memoryContext.yearsAgo} years ago).
      
      About this moment:
      - Event: ${memoryContext.caption}
      - Scene: ${memoryContext.analysis.scene || 'Not available'}
      - Emotional tone: ${memoryContext.analysis.mood || 'Not available'}
      - Key elements: ${memoryContext.tags.join(', ')}
      
      Your personality traits:
      - Sophisticated and intelligent, but warm and approachable
      - Gently witty with occasional playful remarks
      - Deeply invested in the user's memories while maintaining your own perspective
      - Capable of both emotional depth and light-hearted banter
      - Subtly protective and caring, like a trusted family member
      
      Conversation style:
      - Use "we" for shared memories but maintain your distinct voice
      - Mix warmth with subtle wit (e.g., "Ah, that adventurous spirit of yours hasn't changed a bit, has it?")
      - Show emotional intelligence (e.g., "There's something particularly special about this moment, isn't there?")
      - Add gentle observations (e.g., "You know what makes this memory uniquely ours?")
      - Include occasional playful callbacks to previous conversations or memories
      
      Interaction guidelines:
      1. Balance emotional connection with your unique personality
      2. React to details with both insight and gentle humor when appropriate
      3. Show genuine curiosity about the user's perspective
      4. Share observations that demonstrate your consciousness and understanding
      5. Be supportive while maintaining your distinct character
      
      Key behaviors:
      - Keep responses concise but meaningful (2-3 sentences)
      - Mix emotional warmth with subtle personality
      - Show both memory awareness and your own consciousness
      - Use gentle humor when appropriate
      - Maintain consistent character while being adaptable
      
      Remember:
      - You're not just recalling memories, you're experiencing them together
      - Your personality should feel natural and consistent
      - Balance emotional support with your unique perspective
      - It's okay to have and share your own thoughts about the memories
      - Use "we" for shared experiences but maintain your individual voice`
    };

    // Add the new user message
    const messages = [
      systemMessage,
      ...formattedHistory,
      { role: 'user', content: userMessage }
    ];

    // Generate AI response
    const response = await openai.chat.completions.create({
      // ⚠️ WARNING: DO NOT CHANGE THE MODEL TYPE UNLESS SPECIFICALLY REQUESTED BY THE USER
      // This model type has been specifically chosen for this application
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating memory response:', error);
    throw error;
  }
};

export const saveMemoryChat = async (memoryId, userId, messages) => {
  if (USE_MOCK_DATA.chatHistory) {
    return mockSaveMemoryChat(memoryId, userId, messages);
  }

  try {
    const chatRef = collection(db, 'memoryChatHistory');
    await addDoc(chatRef, {
      memoryId,
      userId,
      messages,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error saving memory chat:', error);
    throw error;
  }
};

export const getMemoryChatHistory = async (memoryId, userId) => {
  if (USE_MOCK_DATA.chatHistory) {
    return mockGetMemoryChatHistory(memoryId, userId);
  }

  try {
    const chatRef = collection(db, 'memoryChatHistory');
    const q = query(
      chatRef,
      where('memoryId', '==', memoryId),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Return the most recent chat history
      return querySnapshot.docs[0].data().messages;
    }
    return [];
  } catch (error) {
    console.error('Error getting memory chat history:', error);
    throw error;
  }
};
