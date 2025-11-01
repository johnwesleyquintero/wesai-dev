import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from './systemInstruction';
import { GEMINI_MODEL } from "../constants";

export interface CodeOutput {
  react: string;
}

class CopilotAgent {
    public async generate(prompt: string): Promise<CodeOutput> {
        if (!process.env.API_KEY) {
            throw new Error("API Key is not configured. Please ensure the environment variable is set.");
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const response = await ai.models.generateContent({
                // Using gemini-2.5-flash for faster responses, improving UX for a prototyping tool.
                model: GEMINI_MODEL,
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
            try {
                const parsed = JSON.parse(jsonString);
                // The responseSchema should enforce this, but this is a fallback for safety.
                if (typeof parsed.react !== 'string') {
                    throw new Error("Parsed JSON response is missing the required 'react' property.");
                }
                return parsed as CodeOutput;
            } catch (parseError) {
                console.error("Failed to parse AI response as JSON. Raw response:", jsonString, "Error:", parseError);
                throw new Error("The AI returned an invalid response format. Please try refining your prompt or try again.");
            }

        } catch (error) {
            console.error("Error generating content with CopilotAgent:", error);
            if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('api key not valid')) {
                    throw new Error("Invalid API Key. Please ensure your key is correct and has access to the Gemini API.");
                }
                if (errorMessage.includes('quota')) {
                    throw new Error("API quota exceeded. Please check your project billing or try again later.");
                }
                if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
                     throw new Error("The response was blocked due to safety policies. Please adjust your prompt and try again.");
                }
                if (errorMessage.includes('fetch')) {
                    throw new Error('A network error occurred. Please check your connection and try again.');
                }
                // A more generic API error fallback
                if (error.message.includes('Google')) { // Catches errors from the SDK
                    // Clean up the prefix for a cleaner message
                    const cleanMessage = error.message.replace(/\[.*?\]\s*/, '');
                    throw new Error(`An API error occurred: ${cleanMessage}`);
                }
                // Re-throw other unexpected errors
                throw error;
            }
            throw new Error("An unknown error occurred while generating the component.");
        }
    }
}

const agent = new CopilotAgent();

export default agent;
