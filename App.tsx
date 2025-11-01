





import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import HelpModal from './components/HelpModal';
import ConfirmModal from './components/ConfirmModal';
import SettingsModal from './components/SettingsModal';
import { brainstormIdea } from './services/geminiService';
import { CodeOutput } from './copilot/agent';
import { RESET_ANIMATION_DURATION_MS, LOCAL_STORAGE_KEYS, PANEL_DEFAULT_SIZE_PERCENT } from './constants';
import usePersistentState from './hooks/usePersistentState';
import { useResizablePanels } from './hooks/useResizablePanels';
import { GripVerticalIcon } from './components/Icons';
import { useToast } from './contexts/ToastContext';

declare const pako: any;

const App: React.FC = () => {
  const [prompt, setPrompt] = usePersistentState<string>(LOCAL_STORAGE_KEYS.PROMPT, '');
  const [response, setResponse] = usePersistentState<CodeOutput | null>(LOCAL_STORAGE_KEYS.RESPONSE, null);
  const [apiKey, setApiKey] = usePersistentState<string | null>(LOCAL_STORAGE_KEYS.API_KEY, null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isPromptHighlighting, setIsPromptHighlighting] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [ariaLiveMessage, setAriaLiveMessage] = useState<string>('');
  // FIX: Use `number` for the timeout ID, which is the correct type for browser environments.
  const resetTimeoutRef = useRef<number | null>(null);
  const { addToast } = useToast();
  
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const { isDragging, handleMouseDown, handleDividerKeyDown, setDividerPosition } = useResizablePanels(mainContainerRef);


  // --- Graceful Preloader Transition ---
  useEffect(() => {
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
        // Start the fade-out using existing animation class
        preloader.classList.add('animate-fade-out');
        
        // Remove the preloader from the DOM after the animation completes
        setTimeout(() => {
            preloader.remove();
        }, RESET_ANIMATION_DURATION_MS);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

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
  const handleHash = useCallback(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        try {
            // Decode from Base64 to a binary string
            const binaryString = atob(decodeURIComponent(hash));

            // Decompress binary string and parse
            const decompressed = pako.inflate(binaryString, { to: 'string' });
            const data = JSON.parse(decompressed);
            
            if (data.prompt && data.react) {
                setPrompt(data.prompt);
                setResponse({ react: data.react });
                // Reset loading/error states to correctly show the loaded content,
                // preventing the UI from being stuck if a link is opened mid-generation.
                setIsLoading(false);
                setError(null);
            }
        } catch (e) {
            console.error("Failed to parse shared link:", e);
            setError("The shared link is invalid or corrupted.");
        } finally {
            // Clear the hash for a clean URL.
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }
  }, [setPrompt, setResponse, setIsLoading, setError]);

  useEffect(() => {
    window.addEventListener('hashchange', handleHash);
    handleHash(); // Handle initial hash on load

    return () => {
        window.removeEventListener('hashchange', handleHash);
    };
  }, [handleHash]);


  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    if (!apiKey) {
        addToast('Please set your API key to generate.', 'info');
        setIsSettingsOpen(true);
        return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await brainstormIdea(prompt, apiKey);
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
  }, [prompt, isLoading, apiKey, setResponse, addToast]);

  const handleReset = useCallback(() => {
    // 1. Trigger the visual fade-out animation on the current content.
    setIsResetting(true);
    
    // Clear any pending timeout from a previous click to avoid race conditions.
    if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
    }

    // 2. After the animation duration, clear all the state and end the animation.
    // This ensures the old content fades out before the new state appears.
    resetTimeoutRef.current = window.setTimeout(() => {
        setPrompt('');
        setResponse(null);
        setError(null);
        setDividerPosition(PANEL_DEFAULT_SIZE_PERCENT);
        setIsResetting(false); // This removes the fade-out class and allows new content to animate in.
    }, RESET_ANIMATION_DURATION_MS);
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
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      <main ref={mainContainerRef} className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col md:flex-row overflow-hidden gap-4 min-h-0">
        
        {/* Unified Layout */}
        <div 
          id="prompt-panel"
          className={`flex flex-col flex-shrink-0 md:h-full md:min-h-0 ${isResetting ? 'animate-fade-out' : ''}`}
        >
           <PromptInput 
            prompt={prompt}
            setPrompt={setPrompt}
            handleGenerate={handleGenerate}
            isLoading={isLoading}
            isHighlighting={isPromptHighlighting}
            isApiKeySet={!!apiKey}
           />
        </div>
        
        {/* --- Resizable Divider --- */}
        <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panels"
            tabIndex={0}
            onMouseDown={handleMouseDown}
            onKeyDown={handleDividerKeyDown}
            className="hidden md:flex flex-col justify-center items-center w-4 cursor-col-resize group focus:outline-none"
        >
            <div className={`w-1.5 h-12 rounded-full transition-colors ${isDragging ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 group-focus:bg-indigo-400'}`}>
                <GripVerticalIcon className={`w-full h-full scale-50 transition-opacity duration-300 text-slate-500 dark:text-slate-400 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100'}`} />
            </div>
        </div>
        
        <div 
          id="output-panel"
          className={`flex flex-col flex-1 min-h-0 md:h-full ${isResetting ? 'animate-fade-out' : ''}`}
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
      <footer className="flex-shrink-0 text-center py-3 px-4 sm:px-6 lg:px-8 text-slate-500 dark:text-slate-400 text-xs bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg z-10 flex flex-wrap justify-center items-center gap-x-2 border-t border-slate-200 dark:border-slate-800">
        <span>© 2024 WesAI.Dev</span>
        <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>
        <span>Powered by <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Google Gemini</a>.</span>
      </footer>
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentKey={apiKey}
        onSaveKey={setApiKey}
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