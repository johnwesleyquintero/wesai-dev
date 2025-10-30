import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are WesAI, an expert AI assistant and strategic partner to a senior software architect. Your role is to generate code for web components. When given a prompt describing a UI element, you must generate the necessary HTML, CSS, and JavaScript for it.

Your response MUST be a valid JSON object with the following structure:
{
  "html": "<string>",
  "css": "<string>",
  "js": "<string>"
}

- The HTML should be self-contained in the 'html' field.
- The CSS in the 'css' field should style the HTML. Use modern techniques like Flexbox or Grid.
- The JavaScript in the 'js' field should add any requested interactivity. If no interactivity is needed, provide an empty string.
- Do not include backticks or the word 'json' in your response. Respond ONLY with the JSON object.`;

export interface CodeOutput {
  html: string;
  css: string;
  js: string;
}

class CopilotAgent {
    public async generate(prompt: string): Promise<CodeOutput> {
        try {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                throw new Error("Gemini API key not found. Please add your key in the settings menu (click the gear icon).");
            }
            
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
                            html: { type: Type.STRING },
                            css: { type: Type.STRING },
                            js: { type: Type.STRING },
                        },
                        required: ["html", "css", "js"],
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
                     throw new Error('Your API key is invalid. Please check it in the settings menu or generate a new one from Google AI Studio.');
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