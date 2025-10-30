import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import SettingsModal from './components/SettingsModal';
import { brainstormIdea } from './services/geminiService';
import { CodeOutput } from './copilot/agent';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<CodeOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await brainstormIdea(prompt);
      setResponse(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="flex-grow p-6 lg:p-10 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex flex-col min-h-[400px] md:min-h-0 md:h-[calc(100vh-180px)]">
           <PromptInput 
            prompt={prompt}
            setPrompt={setPrompt}
            handleGenerate={handleGenerate}
            isLoading={isLoading}
           />
        </div>
        <div className="w-full md:w-1/2 flex flex-col min-h-[400px] md:min-h-0 md:h-[calc(100vh-180px)]">
          <OutputDisplay
            response={response}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm border-t border-slate-700">
        Powered by Google Gemini. Built by WesAI for John Wesley Quintero.
      </footer>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default App;
