
import agent, { CodeOutput } from '../copilot/agent';

export const brainstormIdea = async (idea: string): Promise<CodeOutput> => {
    try {
        // Delegate the generation task to our centralized CopilotAgent
        // The agent now sources the API key from the environment.
        return await agent.generate(idea);
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