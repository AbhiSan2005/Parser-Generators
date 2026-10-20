import { generateGeminiText } from './geminiService.js';

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
        5. Use uppercase variable names and simple terminal tokens. Do not quote terminals.
        6. Do not use left recursion when an equivalent simple grammar is available.

        Example output for balanced parentheses:
        S -> A B | a S b | epsilon
        A -> a
        B -> b

        Example output for L = { a^n b^2n | n >= 0 }:
        S -> a S b b | epsilon

        User Language Description: ${description}
    `;

    const response = await generateGeminiText(prompt);
    return response
        .replace(/^```[a-zA-Z]*\s*/, '')
        .replace(/\s*```$/, '')
        .trim();
};
