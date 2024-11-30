/**
 * Utility functions for text processing
 */

/**
 * Extract hashtags from text
 * @param {string} text - The text to extract hashtags from
 * @returns {string[]} Array of hashtags without the # symbol
 */
export const extractHashtags = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Match hashtags that:
  // 1. Start with # 
  // 2. Followed by at least one letter, number, or underscore
  // 3. Can contain letters, numbers, underscores
  // 4. Are not followed by another word character
  const hashtagRegex = /#(\w+)(?=\s|$)/g;
  
  // Extract matches and remove the # symbol
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};
