import React, { useState, useCallback, useLayoutEffect } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import HelpModal from './components/HelpModal';
import { brainstormIdea } from './services/geminiService';
import { CodeOutput } from './copilot/agent';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<CodeOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useLayoutEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
      <Header 
        theme={theme}
        onToggleTheme={toggleTheme}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
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
            theme={theme}
            response={response}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 dark:text-slate-500 text-xs border-t border-slate-200 dark:border-slate-800">
        Powered by Google Gemini. Built by WesAI for John Wesley Quintero.
      </footer>
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;