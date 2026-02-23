import * as deepl from 'deepl-node';

// Initialize DeepL client
// Get free API key from https://www.deepl.com/pro-api
const authKey = process.env.DEEPL_API_KEY;

let translator: deepl.Translator | null = null;

if (authKey) {
  translator = new deepl.Translator(authKey);
}

/**
 * Check if translation service is available
 */
export function isTranslationAvailable(): boolean {
  return translator !== null;
}

/**
 * Translate Japanese text to English
 * @param text Japanese text to translate
 * @returns Translated English text or null if translation fails
 */
export async function translateToEnglish(text: string): Promise<string | null> {
  if (!translator) {
    console.log('⚠️  DeepL API key not set. Set DEEPL_API_KEY env variable.');
    return null;
  }

  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    // Check if text is already English (simple heuristic)
    if (isEnglish(text)) {
      return text;
    }

    const result = await translator.translateText(
      text,
      'ja' as deepl.SourceLanguageCode,
      'en-US' as deepl.TargetLanguageCode
    );

    if (Array.isArray(result)) {
      return result[0].text;
    }

    return result.text;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

/**
 * Translate multiple texts in batch (more efficient)
 * @param texts Array of Japanese texts
 * @returns Array of translated English texts (null for failed translations)
 */
export async function translateBatch(texts: string[]): Promise<(string | null)[]> {
  if (!translator) {
    console.log('⚠️  DeepL API key not set. Set DEEPL_API_KEY env variable.');
    return texts.map(() => null);
  }

  // Filter out empty and already-English texts
  const validTexts = texts.filter(t => t && t.trim().length > 0 && !isEnglish(t));
  
  if (validTexts.length === 0) {
    return texts.map(t => t || null);
  }

  try {
    const results = await translator.translateText(
      validTexts,
      'ja' as deepl.SourceLanguageCode,
      'en-US' as deepl.TargetLanguageCode
    );

    // Map results back to original order
    const resultMap = new Map<string, string>();
    results.forEach((result, index) => {
      resultMap.set(validTexts[index], result.text);
    });

    return texts.map(text => {
      if (!text || text.trim().length === 0) return null;
      if (isEnglish(text)) return text;
      return resultMap.get(text) || null;
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts.map(() => null);
  }
}

/**
 * Simple heuristic to detect if text is English
 */
function isEnglish(text: string): boolean {
  // If more than 70% of characters are basic Latin, consider it English
  const latinChars = text.match(/[\u0000-\u007F]/g) || [];
  return latinChars.length / text.length > 0.7;
}

/**
 * Translate property descriptions with fallback
 */
export async function translateProperty(
  descriptionJp: string | null | undefined
): Promise<string | null> {
  if (!descriptionJp) return null;
  
  const translated = await translateToEnglish(descriptionJp);
  
  if (!translated) {
    // Fallback: return original with note
    return `[Translation pending] ${descriptionJp.substring(0, 100)}...`;
  }
  
  return translated;
}

/**
 * Get translation usage stats (DeepL free tier: 500,000 chars/month)
 */
export async function getTranslationUsage(): Promise<{ characterCount: number; characterLimit: number } | null> {
  if (!translator) return null;

  try {
    const usage = await translator.getUsage();
    if (usage.character) {
      return {
        characterCount: usage.character.count,
        characterLimit: usage.character.limit,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to get usage:', error);
    return null;
  }
}
