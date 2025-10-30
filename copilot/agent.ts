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
    
    private getApiKey(): string {
        const userApiKey = localStorage.getItem('gemini_api_key');
        if (userApiKey) {
            return userApiKey;
        }
        return process.env.API_KEY || '';
    }

    public async generate(prompt: string): Promise<CodeOutput> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error("Gemini API key not found. Please set it in the settings panel.");
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
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
            return JSON.parse(jsonString) as CodeOutput;
        } catch (error) {
            console.error("Error generating content with CopilotAgent:", error);
            if (error instanceof Error) {
                if (error.message.includes('API key not valid')) {
                     throw new Error('The provided API key is invalid. Please check it in the settings.');
                }
                throw new Error(`Agent failed to generate response: ${error.message}`);
            }
            throw new Error("An unknown error occurred within the CopilotAgent.");
        }
    }
}

const agent = new CopilotAgent();

export default agent;
