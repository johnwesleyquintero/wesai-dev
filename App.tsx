import React, { useState, useCallback, useLayoutEffect, useRef } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import HelpModal from './components/HelpModal';
import { brainstormIdea } from './services/geminiService';
import { CodeOutput } from './copilot/agent';
import { GripVerticalIcon } from './components/Icons';
import { PANEL_DEFAULT_SIZE_PERCENT, PANEL_MIN_SIZE_PERCENT, PANEL_MAX_SIZE_PERCENT, RESET_ANIMATION_DURATION_MS } from './constants';
import usePersistentState from './hooks/usePersistentState';
import { useResizablePanels } from './hooks/useResizablePanels';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [prompt, setPrompt] = usePersistentState<string>('prompt', '');
  const [response, setResponse] = usePersistentState<CodeOutput | null>('response', null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [theme, setTheme] = usePersistentState<Theme>('theme', 
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isPromptHighlighting, setIsPromptHighlighting] = useState<boolean>(false);

  // --- Resizable Panel Logic ---
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const {
      dividerPosition,
      setDividerPosition,
      isDragging,
      handleMouseDown,
      handleDividerKeyDown
  } = useResizablePanels(mainContainerRef);

  useLayoutEffect(() => {
    const lightHljs = document.getElementById('hljs-light') as HTMLLinkElement | null;
    const darkHljs = document.getElementById('hljs-dark') as HTMLLinkElement | null;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (lightHljs) lightHljs.disabled = true;
      if (darkHljs) darkHljs.disabled = false;
    } else {
      document.documentElement.classList.remove('dark');
      if (lightHljs) lightHljs.disabled = false;
      if (darkHljs) darkHljs.disabled = true;
    }
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
  }, [prompt, isLoading, setResponse]);

  const handleReset = useCallback(() => {
    setIsResetting(true);
    setTimeout(() => {
      setPrompt('');
      setResponse(null);
      setError(null);
      setDividerPosition(PANEL_DEFAULT_SIZE_PERCENT);
      // usePersistentState will handle removing from localStorage
      setIsResetting(false);
    }, RESET_ANIMATION_DURATION_MS); // Match animation duration
  }, [setPrompt, setResponse, setDividerPosition]);
  
  const handleReusePrompt = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
    setIsPromptHighlighting(true);
    // Duration should be slightly longer than the animation
    setTimeout(() => setIsPromptHighlighting(false), 900);
  }, [setPrompt]);


  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-300">
      <Header 
        theme={theme}
        onToggleTheme={toggleTheme}
        onHelpClick={() => setIsHelpOpen(true)}
        onResetClick={handleReset}
      />
      <main ref={mainContainerRef} className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden gap-6 md:gap-0">
        
        {/* Unified Layout */}
        <div 
          id="prompt-panel"
          className={`flex flex-col md:h-full md:min-h-0 ${isResetting ? 'animate-fade-out' : ''} ${!isDragging ? 'transition-[width] duration-200 ease-out' : ''}`}
          style={{ width: 'var(--panel-one-width, 100%)' }}
        >
           <PromptInput 
            prompt={prompt}
            setPrompt={setPrompt}
            handleGenerate={handleGenerate}
            isLoading={isLoading}
            isHighlighting={isPromptHighlighting}
           />
        </div>
        
        <div 
            onMouseDown={handleMouseDown}
            onKeyDown={handleDividerKeyDown}
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-controls="prompt-panel output-panel"
            aria-label="Resize panels"
            aria-valuenow={Math.round(dividerPosition)}
            aria-valuemin={PANEL_MIN_SIZE_PERCENT}
            aria-valuemax={PANEL_MAX_SIZE_PERCENT}
            className="hidden md:flex w-4 cursor-col-resize flex-shrink-0 items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-full transition-colors duration-300 group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20"
        >
            <div className={`w-0.5 h-16 bg-slate-300 dark:bg-slate-700 rounded-full transition-all relative ${isDragging ? 'duration-75 bg-indigo-500 scale-x-150 shadow-[0_0_15px_3px_theme(colors.indigo.500)]' : 'duration-300 group-hover:bg-indigo-500/60 group-hover:scale-x-125 group-focus:bg-indigo-500/60 group-focus:scale-x-125'}`}>
               <div className={`absolute bottom-full mb-2.5 -translate-x-1/2 left-1/2 bg-slate-800 text-white text-xs font-mono py-1 px-2.5 rounded-md shadow-lg transition-opacity duration-200 pointer-events-none ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
                    {Math.round(dividerPosition)}%&nbsp;/&nbsp;{100 - Math.round(dividerPosition)}%
               </div>
               <GripVerticalIcon className={`absolute text-slate-500 dark:text-slate-400 w-5 h-5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 group-hover:opacity-100 group-focus:opacity-100 group-active:text-indigo-600 dark:group-active:text-indigo-400 transition-all duration-200 ${isDragging ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            </div>
        </div>
        
        <div 
          id="output-panel"
          className={`flex flex-col md:h-full md:min-h-0 ${isResetting ? 'animate-fade-out' : ''} ${!isDragging ? 'transition-[width] duration-200 ease-out' : ''}`}
          style={{ width: 'var(--panel-two-width, 100%)' }}
        >
          <OutputDisplay
            response={response}
            isLoading={isLoading}
            error={error}
            setPrompt={setPrompt}
            onReusePrompt={handleReusePrompt}
            theme={theme}
            prompt={prompt}
          />
        </div>
      </main>
      <footer className="text-center py-3 px-4 sm:px-6 lg:px-8 text-slate-500 dark:text-slate-500 text-xs bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg sticky bottom-0 z-10 flex flex-wrap justify-center items-center gap-x-2 border-t border-slate-200 dark:border-slate-800">
        <span>© 2024 WesAI.Dev</span>
        <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>
        <span>A <a href="https://jwq.dev" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">John Wesley Quintero</a> Project</span>
        <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>
        <span>Powered by <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Google Gemini</a>.</span>
      </footer>
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;