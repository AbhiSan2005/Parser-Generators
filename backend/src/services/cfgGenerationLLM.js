import OpenAI from "openai";
import "dotenv/config";

const ai = new OpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY
});

export const generateCfgStringFromLLM = async (description) => {
    const prompt = `
        You are an expert in Theory of Computation and Context-Free Grammars (CFG).

        The user will provide a description of a formal language. The description may be written in either:

        1) Natural English
        Example: Language of balanced parentheses

        2) Formal mathematical notation
        Example: L = { a^n b^2n | n >= 0 }

        Your task is to analyze the language and generate the Context-Free Grammar (CFG) that defines it.

        OUTPUT FORMAT:
        Return ONLY the plain text grammar rules. No explanations, no JSON, no markdown blocks.
        
        Syntax Rules:
        1. Use "->" to separate the left side and right side.
        2. Use "|" to separate alternative rules for the same variable.
        3. STRICTLY space-separate every single symbol/token on the right side. 
        4. Use "epsilon" to represent the null string.

        Example output for balanced parentheses:
        S -> A B | a S b | epsilon
        A -> a
        B -> b

        Example output for L = { a^n b^2n | n >= 0 }:
        S -> a S b b | epsilon

        User Language Description: ${description}
    `;

    try {
        const payload = {
            model: "z-ai/glm-5.2", 
            messages: [{ "role": "user", "content": prompt }],
            temperature: 0.1,
            top_p: 0.95,
            chat_template_kwargs: { "thinking": true },
            stream: false
        };

        const response = await ai.chat.completions.create(payload);

        let finalString = response.choices[0].message.content.trim();

        finalString = finalString.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        finalString = finalString.replace(/```[a-zA-Z]*\n?/g, '').trim();
        finalString = finalString.replace(/```/g, '').trim();

        return finalString; 
        
    } catch (error) {
        console.error("CFG LLM Error:", error.message);
        throw new Error("Failed to generate CFG string");
    }
};