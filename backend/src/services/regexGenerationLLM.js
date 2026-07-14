import OpenAI from "openai";
import "dotenv/config"

const ai = new OpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY
})

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
        • Do not include explanations.
        • Output must be valid JSON.

        User Language Description: ${description}
    `

    try {
        const payload = {
            model: "z-ai/glm-5.2",
            messages: [{ "role": "user", "content": prompt }],
            temperature: 0.1,
            top_p: 0.95,
            chat_template_kwargs: { "thinking": true },
            stream: false
        }

        const response = await ai.chat.completions.create(payload);

        let finalJSON = response.choices[0].message.content.trim();

        finalJSON = finalJSON.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        finalJSON = finalJSON.replace(/```json|```/g, '').trim();

        return JSON.parse(finalJSON);
    }
    catch (error) {
        console.error("LLM Error:", error.message);
        throw new Error("Failed to generate Regex");
    }
}
