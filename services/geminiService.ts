
import agent, { CodeOutput } from '../copilot/agent';

export const brainstormIdea = async (idea: string, apiKey: string): Promise<CodeOutput> => {
    try {
        // Delegate the generation task to our centralized CopilotAgent
        // The agent now receives the API key directly for each call.
        return await agent.generate(idea, apiKey);
    } catch (error) {
        console.error("Error calling Gemini API via agent:", error);
        // Re-throw the error to be handled by the UI component.
        // The agent now provides more user-friendly error messages.
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while brainstorming.");
    }
};
