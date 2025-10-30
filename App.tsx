import React, { useState, useCallback, useLayoutEffect, useRef, useEffect } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import { brainstormIdea } from './services/geminiService';
import { CodeOutput } from './copilot/agent';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<CodeOutput | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // --- Resizable Panel Logic ---
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && mainContainerRef.current) {
      const containerRect = mainContainerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constrain panel sizes
      if (newPosition > 25 && newPosition < 75) {
        setDividerPosition(newPosition);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  // --- End Resizable Panel Logic ---


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
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
      <Header 
        theme={theme}
        onToggleTheme={toggleTheme}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col overflow-hidden">
        {/* Mobile Layout: Stacked */}
        <div className="md:hidden flex flex-col gap-6 flex-grow">
            <div className="w-full flex flex-col flex-1 min-h-0">
               <PromptInput 
                prompt={prompt}
                setPrompt={setPrompt}
                handleGenerate={handleGenerate}
                isLoading={isLoading}
               />
            </div>
            <div className="w-full flex flex-col flex-1 min-h-0">
              <OutputDisplay
                response={response}
                isLoading={isLoading}
                error={error}
                setPrompt={setPrompt}
                theme={theme}
              />
            </div>
        </div>
        
        {/* Desktop Layout: Resizable */}
        <div ref={mainContainerRef} className="hidden md:flex flex-row w-full flex-grow gap-4">
            <div className="flex flex-col h-full" style={{ width: `${dividerPosition}%` }}>
               <PromptInput 
                prompt={prompt}
                setPrompt={setPrompt}
                handleGenerate={handleGenerate}
                isLoading={isLoading}
               />
            </div>
            <div 
                onMouseDown={handleMouseDown}
                className="w-2 cursor-col-resize flex-shrink-0 flex items-center justify-center group"
            >
                <div className="w-1 h-1/4 bg-slate-300 dark:bg-slate-700 rounded-full group-hover:bg-indigo-500 transition-all duration-200 group-hover:scale-x-150"></div>
            </div>
            <div className="flex flex-col h-full" style={{ width: `calc(100% - ${dividerPosition}% - 8px)` }}>
              <OutputDisplay
                response={response}
                isLoading={isLoading}
                error={error}
                setPrompt={setPrompt}
                theme={theme}
              />
            </div>
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 dark:text-slate-500 text-xs border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
        © 2025 WesAI.Dev | Powered by Google Gemini.
      </footer>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;