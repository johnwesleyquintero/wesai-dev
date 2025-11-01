import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import HelpModal from './components/HelpModal';
import ConfirmModal from './components/ConfirmModal';
import { brainstormIdea } from './services/geminiService';
import { CodeOutput } from './copilot/agent';
import { GripVerticalIcon } from './components/Icons';
import { PANEL_DEFAULT_SIZE_PERCENT, PANEL_MIN_SIZE_PERCENT, PANEL_MAX_SIZE_PERCENT, RESET_ANIMATION_DURATION_MS, LOCAL_STORAGE_KEYS } from './constants';
import usePersistentState from './hooks/usePersistentState';
import { useResizablePanels } from './hooks/useResizablePanels';

declare const pako: any;

const App: React.FC = () => {
  const [prompt, setPrompt] = usePersistentState<string>(LOCAL_STORAGE_KEYS.PROMPT, '');
  const [response, setResponse] = usePersistentState<CodeOutput | null>(LOCAL_STORAGE_KEYS.RESPONSE, null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isPromptHighlighting, setIsPromptHighlighting] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [ariaLiveMessage, setAriaLiveMessage] = useState<string>('');
  const resetTimeoutRef = useRef<number | null>(null);

  // --- Resizable Panel Logic ---
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const {
      dividerPosition,
      setDividerPosition,
      isDragging,
      handleMouseDown,
      handleDividerKeyDown
  } = useResizablePanels(mainContainerRef);

  // --- Dynamic Document Title & Favicon ---
  useEffect(() => {
    const baseTitle = 'WesAI.Dev';
    const faviconLink = document.querySelector("link[rel='icon']");
    if (!faviconLink) return;

    const originalFavicon = faviconLink.getAttribute('href');
    const loadingFavicon = "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='faviconGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234f46e5;'/%3E%3Cstop offset='100%25' style='stop-color:%2306b6d4;'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='6' fill='url(%23faviconGrad)'/%3E%3Cpath d='M8 10 L12 22 L16 12 L20 22 L24 10' stroke='white' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Canimate attributeName='opacity' values='0.5;1;0.5' dur='1.5s' repeatCount='indefinite' /%3E%3C/path%3E%3C/svg%3E";
    
    if (isLoading) {
      document.title = `Generating... | ${baseTitle}`;
      faviconLink.setAttribute('href', loadingFavicon);
    } else if (response && prompt) {
        const promptSnippet = prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt;
        document.title = `Preview: ${promptSnippet} | ${baseTitle}`;
        if (originalFavicon) faviconLink.setAttribute('href', originalFavicon);
    } else {
        document.title = baseTitle;
        if (originalFavicon) faviconLink.setAttribute('href', originalFavicon);
    }

    // Cleanup on unmount
    return () => {
        if (originalFavicon) faviconLink.setAttribute('href', originalFavicon);
    };

  }, [isLoading, response, prompt]);
  
  // --- Accessibility: ARIA Live Region for Screen Readers ---
  useEffect(() => {
    if (isLoading) {
      setAriaLiveMessage('Generation started.');
    }
  }, [isLoading]);

  useEffect(() => {
    if (error) {
      setAriaLiveMessage(`An error occurred: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && response && !error) {
        // Announce completion after a short delay to feel more natural
        const timer = setTimeout(() => {
            setAriaLiveMessage('Generation complete. Preview is now available.');
            // Move focus to the preview tab for improved keyboard navigation and accessibility.
            document.getElementById('tab-preview')?.focus();
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [isLoading, response, error]);

  // --- Handle Shared Links on Load & on Hash Change ---
  useEffect(() => {
    const handleHash = () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            try {
                const decodedString = atob(decodeURIComponent(hash));
                const decompressed = pako.inflate(decodedString, { to: 'string' });
                const data = JSON.parse(decompressed);
                if (data.prompt && data.react) {
                    setPrompt(data.prompt);
                    setResponse({ react: data.react });
                }
            } catch (e) {
                console.error("Failed to parse shared link:", e);
                setError("The shared link is invalid or corrupted.");
            } finally {
                // Clear the hash for a clean URL.
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    };
    
    window.addEventListener('hashchange', handleHash);
    handleHash(); // Handle initial hash on load

    return () => {
        window.removeEventListener('hashchange', handleHash);
    };
  }, []);


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
    // Clear any pending timeout from a previous click
    if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
    }
    resetTimeoutRef.current = window.setTimeout(() => {
      setPrompt('');
      setResponse(null);
      setError(null);
      setDividerPosition(PANEL_DEFAULT_SIZE_PERCENT);
      setIsResetting(false);
    }, RESET_ANIMATION_DURATION_MS); // Match animation duration
  }, [setPrompt, setResponse, setError, setDividerPosition]);

  // Cleanup for the reset timeout to prevent memory leaks
  useEffect(() => {
    return () => {
        if (resetTimeoutRef.current) {
            clearTimeout(resetTimeoutRef.current);
        }
    };
  }, []);
  
  const handleReusePrompt = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
    setIsPromptHighlighting(true);
    document.getElementById('prompt-input')?.focus();
    // Duration should be slightly longer than the animation
    setTimeout(() => setIsPromptHighlighting(false), 900);
  }, [setPrompt]);


  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-normal">
      {/* Visually hidden container for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {ariaLiveMessage}
      </div>

      <Header 
        onHelpClick={() => setIsHelpOpen(true)}
        onResetClick={() => setIsResetModalOpen(true)}
      />
      <main ref={mainContainerRef} className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden gap-6 md:gap-0">
        
        {/* Unified Layout */}
        <div 
          id="prompt-panel"
          className={`flex flex-col md:h-full md:min-h-0 ${isResetting ? 'animate-fade-out' : ''} ${!isDragging ? 'transition-[flex-basis] duration-fast ease-out-quad' : ''}`}
          style={{ flexBasis: 'var(--panel-one-basis, 50%)' }}
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
            className="hidden md:flex w-4 cursor-col-resize flex-shrink-0 items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-full transition-colors duration-normal"
        >
            <div className={`w-0.5 h-16 bg-slate-200 dark:bg-slate-800 rounded-full transition-all relative ${isDragging ? 'duration-75 bg-indigo-500 scale-x-150 shadow-xl shadow-indigo-500/30' : 'duration-normal group-hover:bg-indigo-500/60 group-focus-visible:bg-indigo-500/60'}`}>
               <div className={`absolute bottom-full mb-2.5 -translate-x-1/2 left-1/2 bg-slate-800 text-white text-xs font-mono py-1 px-2.5 rounded-md shadow-lg transition-opacity duration-fast pointer-events-none ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
                    {Math.round(dividerPosition)}%&nbsp;/&nbsp;{100 - Math.round(dividerPosition)}%
               </div>
               <GripVerticalIcon className={`absolute text-slate-500 dark:text-slate-400 w-5 h-5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 group-hover:scale-125 group-focus-visible:opacity-100 group-focus-visible:scale-125 group-active:text-indigo-600 dark:group-active:text-indigo-400 transition-all duration-fast ${isDragging ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            </div>
        </div>
        
        <div 
          id="output-panel"
          className={`flex flex-col md:h-full md:min-h-0 md:flex-1 ${isResetting ? 'animate-fade-out' : ''}`}
        >
          <OutputDisplay
            response={response}
            isLoading={isLoading}
            error={error}
            setPrompt={setPrompt}
            onReusePrompt={handleReusePrompt}
            prompt={prompt}
            onRetry={handleGenerate}
          />
        </div>
      </main>
      <footer className="text-center py-3 px-4 sm:px-6 lg:px-8 text-slate-500 dark:text-slate-400 text-xs bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg sticky bottom-0 z-10 flex flex-wrap justify-center items-center gap-x-2 border-t border-slate-200 dark:border-slate-800">
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
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleReset}
        title="Start New Session?"
        message="This will clear your current prompt and output. Are you sure you want to continue?"
        confirmText="Reset Session"
        confirmVariant="destructive"
      />
    </div>
  );
};

export default App;