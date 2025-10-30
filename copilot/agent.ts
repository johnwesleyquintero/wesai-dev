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
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("API_KEY is not available. The agent cannot be initialized.");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    public async generate(prompt: string): Promise<CodeOutput> {
        try {
            const response = await this.ai.models.generateContent({
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
            // The response should be a JSON string, parse it to return the object.
            return JSON.parse(jsonString) as CodeOutput;
        } catch (error) {
            console.error("Error generating content with CopilotAgent:", error);
            if (error instanceof Error) {
                throw new Error(`Agent failed to generate response: ${error.message}`);
            }
            throw new Error("An unknown error occurred within the CopilotAgent.");
        }
    }
}

// Create a singleton instance of the agent to be used throughout the application.
// This ensures we don't re-initialize the agent on every request.
const agent = new CopilotAgent(process.env.API_KEY || '');

export default agent;