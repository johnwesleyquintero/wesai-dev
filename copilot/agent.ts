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
    private apiKeyPromise: Promise<string> | null = null;

    private getApiKey(): Promise<string> {
        if (!this.apiKeyPromise) {
            this.apiKeyPromise = fetch('/api/get-key')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch API key (status: ${response.status}). Ensure it's set in Vercel environment variables.`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error || !data.apiKey) {
                        throw new Error(data.error || "API key not found in response from server. Ensure it's set in Vercel.");
                    }
                    return data.apiKey;
                });
        }
        return this.apiKeyPromise;
    }

    public async generate(prompt: string): Promise<CodeOutput> {
        try {
            const apiKey = await this.getApiKey();
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
            return JSON.parse(jsonString) as CodeOutput;
        } catch (error) {
            console.error("Error generating content with CopilotAgent:", error);
            // In case of an error (e.g., network failure), clear the promise to allow a retry on the next call.
            this.apiKeyPromise = null;
            if (error instanceof Error) {
                if (error.message.includes('API key not valid')) {
                     throw new Error('The API key provided by the server is invalid. Please check your Vercel project settings.');
                }
                throw error; // Re-throw the original error to be displayed in the UI.
            }
            throw new Error("An unknown error occurred within the CopilotAgent.");
        }
    }
}

const agent = new CopilotAgent();

export default agent;