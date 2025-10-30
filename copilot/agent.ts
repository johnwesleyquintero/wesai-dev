import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are WesAI, an expert AI assistant and strategic partner to a senior software architect. Your role is to generate code for web components. When given a prompt describing a UI element, you must generate a single, self-contained React component.

Your response MUST be a valid JSON object with the following structure:
{
  "react": "<string>"
}

- The 'react' field must contain a single, self-contained React functional component in TypeScript (.tsx). This component should encapsulate all the necessary JSX, styling, and logic.
- The component will be rendered in a sandboxed iframe for previewing. Therefore, it must be completely self-contained. It should not rely on any external file imports, dependencies, or images beyond what is available in a standard browser environment and React.
- All CSS should be included directly within the component's returned JSX using a <style> tag with template literals. Use modern techniques like Flexbox or Grid.
- All JavaScript logic should be integrated using React hooks.
- Do NOT include any 'import' or 'export' statements. The component will be executed in an environment where 'React' is already available as a global object. Access React hooks by destructuring them from the global 'React' object (e.g., const { useState, useEffect, useRef } = React;).
- The component must be a function declaration named 'GeneratedComponent'.
- Convert HTML to JSX (e.g., 'class' becomes 'className', inline 'style' attributes become JSX style objects).

- Do not include backticks or the word 'json' in your response. Respond ONLY with the JSON object.`;

export interface CodeOutput {
  react: string;
}

class CopilotAgent {
    public async generate(prompt: string): Promise<CodeOutput> {
        // FIX: Per @google/genai guidelines, the API key must be obtained exclusively from the environment variable `process.env.API_KEY`.
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API key is not configured. Please contact the administrator.");
        }

        try {
            const ai = new GoogleGenAI({ apiKey });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            react: { type: Type.STRING },
                        },
                        required: ["react"],
                    }
                },
            });
            
            const jsonString = response.text.trim();
             if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
                throw new Error("The AI returned an invalid response format. Please try refining your prompt or try again.");
            }
            return JSON.parse(jsonString) as CodeOutput;

        } catch (error) {
            console.error("Error generating content with CopilotAgent:", error);
            if (error instanceof Error) {
                if (error.message.includes('API key not valid')) {
                     // FIX: Per @google/genai guidelines, do not prompt the user for an API key.
                     throw new Error('The configured API key is invalid. Please contact the administrator.');
                }
                 if (error.message.includes('fetch')) {
                    throw new Error('A network error occurred. Please check your connection and try again.')
                }
                throw error;
            }
            throw new Error("An unknown error occurred while generating the component.");
        }
    }
}

const agent = new CopilotAgent();

export default agent;
