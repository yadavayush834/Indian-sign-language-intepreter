import Groq from 'groq-sdk';
import signAssets from '../assets/signAssets.json';

// Get the API key from environment variables
const apiKey = import.meta.env.VITE_GROQ_API_KEY;

let groq;
if (apiKey) {
  groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
}

function normalizeKeyword(word) {
  return String(word || '')
    .toUpperCase()
    .replace(/[^\w\s-]/g, '')
    .trim();
}

function toSignToken(word) {
  const normalized = normalizeKeyword(word);
  if (!normalized) return '';

  if (signAssets[normalized]) return normalized;

  const underscored = normalized.replace(/[\s-]+/g, '_');
  if (signAssets[underscored]) return underscored;

  const compact = normalized.replace(/[\s_-]+/g, '');
  if (signAssets[compact]) return compact;

  // Fallback for custom videos named like /assets/signs/my_word.mp4
  return underscored;
}

/**
 * Converts a natural language sentence into an array of sign language keywords.
 * @param {string} text - The input sentence.
 * @returns {Promise<string[]>} - An array of uppercase keywords.
 */
export async function translateTextToSigns(text) {
  if (!groq) {
    console.error("Groq API key is not configured. Please set VITE_GROQ_API_KEY in .env");
    // Fallback: simple split if no API key
    return fallbackTranslation(text);
  }

  try {
    const availableSigns = Object.keys(signAssets).join(", ");
    
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert Indian Sign Language (ISL) translator. 
Your job is to convert English sentences into a sequence of simplified ISL keywords. 
Rules:
1. Prioritize words from this list when suitable: ${availableSigns}.
2. You may also output other simple keywords from the user sentence if needed.
3. Return the result ONLY as a valid JSON array of uppercase strings. Do not include markdown formatting or explanations.
Example: ["HELLO", "HOW", "YOU"]`
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
    });

    let content = response.choices[0]?.message?.content?.trim();
    
    // Attempt to parse JSON safely
    try {
      // Remove any markdown formatting if the model still includes it
      if (content.startsWith('```json')) {
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const keywords = JSON.parse(content);

      const playableSigns = keywords
        .map(toSignToken)
        .filter(Boolean);

      return playableSigns.length > 0 ? playableSigns : fallbackTranslation(text);
      
    } catch (parseError) {
      console.error("Failed to parse Groq response:", content);
      return fallbackTranslation(text);
    }

  } catch (error) {
    console.error("Groq API Error:", error);
    return fallbackTranslation(text);
  }
}

/**
 * Fallback local NLP if Groq fails or is not configured
 */
function fallbackTranslation(text) {
  const words = text
    .split(/\s+/)
    .map(toSignToken)
    .filter(Boolean);

  return words;
}
