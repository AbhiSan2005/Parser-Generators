import { generateGeminiText } from './geminiService.js';

export const generateRegexFromLLM = async (description) => {
    const prompt =
        `
        You are an expert in Theory of Computation and Formal Languages.

        The user will provide a description of a formal language. The description may be written in either:

        1) Natural English
        Example:
        Language of all strings starting with '0' over {0,1}

        2) Formal mathematical notation
        Example:
        L = { w | w ∈ {0,1}*, w starts with 0 }

        Your task is to analyze the language and produce the correct result.

        Follow these steps internally:

        Step 1 — Parse the description
        • Identify the alphabet Σ used in the language.
        • Understand the constraints on the strings.

        Step 2 — Determine the language type
        Classify the language into one of the following categories:

        REGULAR
        CONTEXT FREE
        CONTEXT SENSITIVE
        RECURSIVELY ENUMERABLE

        Step 3 — If the language is REGULAR
        Construct a mathematically correct regular expression using ONLY the following syntax rules:

        +  → union
        *  → Kleene closure
        .  → concatenation

        Example:
        (0+1)*.0

        Step 4 — If the language is NOT REGULAR
        Do not generate a regex and say NONE

        Step 5 — Output format
        Return ONLY valid JSON with no explanations, comments, or additional text.

        The JSON must follow this exact format:

        {
            "language_type": "<TYPE>",
            "regex": "<REGEX or NONE>"
        }

        Rules:
        • Use only symbols from the detected alphabet.
        • If the language is not regular, set regex to "NONE".
        • Do not include explanations or Markdown.
        • Return only the requested JSON object.

        User Language Description: ${description}
    `;

    const responseFormat = {
        type: 'text',
        mime_type: 'application/json',
        schema: {
            type: 'object',
            properties: {
                language_type: {
                    type: 'string',
                    enum: ['REGULAR', 'CONTEXT FREE', 'CONTEXT SENSITIVE', 'RECURSIVELY ENUMERABLE']
                },
                regex: { type: 'string' }
            },
            required: ['language_type', 'regex'],
            additionalProperties: false
        }
    };

    const responseText = await generateGeminiText(prompt, responseFormat);
    let result;
    try {
        result = JSON.parse(responseText.replace(/^```(?:json)?\s*|\s*```$/g, ''));
    } catch {
        throw new Error('Gemini returned an invalid regex response. Please try a more specific language description.');
    }

    if (typeof result.regex !== 'string' || typeof result.language_type !== 'string') {
        throw new Error('Gemini returned an incomplete regex response. Please try again.');
    }

    return result;
};
