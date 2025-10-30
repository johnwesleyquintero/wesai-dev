import agent, { CodeOutput } from '../copilot/agent';

export const brainstormIdea = async (idea: string): Promise<CodeOutput> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set. Please ensure it is configured correctly.");
    }

    try {
        // Delegate the generation task to our centralized CopilotAgent
        return await agent.generate(idea);
    } catch (error) {
        console.error("Error calling Gemini API via agent:", error);
        // Re-throw the error to be handled by the UI component
        if (error instanceof Error) {
            throw new Error(`An error occurred while brainstorming: ${error.message}`);
        }
        throw new Error("An unknown error occurred while brainstorming.");
    }
};