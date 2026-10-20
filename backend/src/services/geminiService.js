import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL = 'gemini-3.5-flash-lite';

let cachedApiKey = '';
let cachedClient;

const getClient = () => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        throw new Error('Gemini is not configured. Set GEMINI_API_KEY in the backend environment.');
    }

    if (!cachedClient || cachedApiKey !== apiKey) {
        cachedApiKey = apiKey;
        cachedClient = new GoogleGenAI({ apiKey });
    }

    return cachedClient;
};

export const generateGeminiText = async (prompt, responseFormat) => {
    try {
        const response = await getClient().interactions.create({
            model: GEMINI_MODEL,
            input: prompt,
            store: false,
            ...(responseFormat ? { response_format: responseFormat } : {})
        });

        const text = response.output_text?.trim();
        if (!text) throw new Error('Gemini returned an empty response.');
        return text;
    } catch (error) {
        const status = error.status || error.statusCode;
        console.error('Gemini generation request failed:', status || error.name);

        if (status === 401 || status === 403) {
            throw new Error('Gemini authentication failed. Check that GEMINI_API_KEY is valid and enabled for the Gemini API.');
        }
        if (status === 429) {
            throw new Error('Gemini rate limit reached. Please wait a moment and try again.');
        }
        if (error.message?.startsWith('Gemini is not configured') || error.message === 'Gemini returned an empty response.') {
            throw error;
        }
        throw new Error('Gemini could not generate a result. Please try again.');
    }
};