import React, { useState, useCallback, useRef, useEffect, useReducer } from 'react';
import pako from 'pako';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptInput from './components/PromptInput';
import OutputDisplay from './components/OutputDisplay';
import HelpModal from './components/HelpModal';
import ConfirmModal from './components/ConfirmModal';
import { brainstormIdea } from './services/geminiService';
import { CodeOutput } from './copilot/agent';
import { RESET_ANIMATION_DURATION_MS, LOCAL_STORAGE_KEYS, PANEL_DEFAULT_SIZE_PERCENT } from './constants';
import usePersistentState from './hooks/usePersistentState';
import { useResizablePanels } from './hooks/useResizablePanels';
import { GripVerticalIcon } from './components/Icons';

// --- State Management with Reducer ---

interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  response: CodeOutput | null;
  error: string | null;
}

type GenerationAction =
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: CodeOutput }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'RESET' };

const generationReducer = (state: GenerationState, action: GenerationAction): GenerationState => {
  switch (action.type) {
    case 'GENERATE_START':
      return { status: 'loading', response: null, error: null };
    case 'GENERATE_SUCCESS':
      return { status: 'success', response: action.payload, error: null };
    case 'GENERATE_ERROR':
      return { status: 'error', response: null, error: action.payload };
    case 'RESET':
      return { status: 'idle', response: null, error: null };
    default:
      return state;
  }
};

const initializer = (): GenerationState => {
  try {
    const storedResponse = localStorage.getItem(LOCAL_STORAGE_KEYS.RESPONSE);
    if (storedResponse) {
      return { status: 'success', response: JSON.parse(storedResponse), error: null };
    }
  } catch (e) {
    console.error("Failed to parse stored response:", e);
  }
  return { status: 'idle', response: null, error: null };
};

// --- Main App Component ---

const App: React.FC = () => {
  const [prompt, setPrompt] = usePersistentState<string>(LOCAL_STORAGE_KEYS.PROMPT, '');
  const [generationState, dispatch] = useReducer(generationReducer, undefined, initializer);

  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isPromptHighlighting, setIsPromptHighlighting] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [ariaLiveMessage, setAriaLiveMessage] = useState<string>('');
  const generationRef = useRef(0);
  
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const { isDragging, handleMouseDown, handleDividerKeyDown, setDividerPosition } = useResizablePanels(mainContainerRef);

  // --- Side Effects ---

  // Graceful Preloader Transition
  useEffect(() => {
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
        preloader.classList.add('animate-fade-out');
        setTimeout(() => {
            preloader.remove();
        }, RESET_ANIMATION_DURATION_MS);
    }
  }, []);

  // Persist response to localStorage when it changes
  useEffect(() => {
    try {
        if (generationState.response) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.RESPONSE, JSON.stringify(generationState.response));
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.RESPONSE);
        }
    } catch (e) {
        console.error("Failed to save response to localStorage:", e);
    }
  }, [generationState.response]);

  // Dynamic Document Title & Favicon
  useEffect(() => {
    const baseTitle = 'WesAI.Dev';
    const faviconLink = document.querySelector("link[rel='icon']");
    if (!faviconLink) return;

    const originalFavicon = faviconLink.getAttribute('href');
    const loadingFavicon = "data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='faviconGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234f46e5;'/%3E%3Cstop offset='100%25' style='stop-color:%2306b6d4;'/%3E%3C/defs%3E%3Crect width='32' height='32' rx='6' fill='url(%23faviconGrad)'/%3E%3Cpath d='M8 10 L12 22 L16 12 L20 22 L24 10' stroke='white' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Canimate attributeName='opacity' values='0.5;1;0.5' dur='1.5s' repeatCount='indefinite' /%3E%3C/path%3E%3C/svg%3E";
    
    if (generationState.status === 'loading') {
      document.title = `Generating... | ${baseTitle}`;
      faviconLink.setAttribute('href', loadingFavicon);
    } else if (generationState.response && prompt) {
        const promptSnippet = prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt;
        document.title = `Preview: ${promptSnippet} | ${baseTitle}`;
        if (originalFavicon) faviconLink.setAttribute('href', originalFavicon);
    } else {
        document.title = baseTitle;
        if (originalFavicon) faviconLink.setAttribute('href', originalFavicon);
    }

    return () => {
        if (originalFavicon) faviconLink.setAttribute('href', originalFavicon);
    };
  }, [generationState.status, generationState.response, prompt]);
  
  // Accessibility: ARIA Live Region for Screen Readers
  useEffect(() => {
    if (generationState.status === 'loading') {
      setAriaLiveMessage('Generation started.');
    } else if (generationState.status === 'error' && generationState.error) {
      setAriaLiveMessage(`An error occurred: ${generationState.error}`);
    } else if (generationState.status === 'success' && generationState.response) {
        const timer = setTimeout(() => {
            setAriaLiveMessage('Generation complete. Preview is now available.');
            document.getElementById('tab-preview')?.focus();
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [generationState.status, generationState.response, generationState.error]);

  // Handle Shared Links on Load & on Hash Change
  const handleHash = useCallback(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        try {
            const binaryString = atob(decodeURIComponent(hash));
            // FIX: pako.inflate expects a Uint8Array, not a binary string.
            // Convert the binary string from atob to a Uint8Array.
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decompressed = pako.inflate(bytes, { to: 'string' });
            const data = JSON.parse(decompressed);
            
            if (data.prompt && data.react) {
                setPrompt(data.prompt);
                dispatch({ type: 'GENERATE_SUCCESS', payload: { react: data.react } });
            }
        } catch (e) {
            console.error("Failed to parse shared link:", e);
            dispatch({ type: 'GENERATE_ERROR', payload: "The shared link is invalid or corrupted." });
        } finally {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }
  }, [setPrompt]);

  useEffect(() => {
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => {
        window.removeEventListener('hashchange', handleHash);
    };
  }, [handleHash]);

  // --- Event Handlers ---

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || generationState.status === 'loading') return;

    const currentGenerationId = ++generationRef.current;
    dispatch({ type: 'GENERATE_START' });

    try {
      const result = await brainstormIdea(prompt);
      if (generationRef.current === currentGenerationId) {
        dispatch({ type: 'GENERATE_SUCCESS', payload: result });
      }
    } catch (e) {
      if (generationRef.current === currentGenerationId) {
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        dispatch({ type: 'GENERATE_ERROR', payload: errorMessage });
      }
    }
  }, [prompt, generationState.status]);

  const handleReset = useCallback(() => {
    generationRef.current++; // Invalidate any ongoing generations
    setDividerPosition(PANEL_DEFAULT_SIZE_PERCENT);
    setIsResetting(true); // Trigger fade-out animation

    // Decouple state reset from CSS animation name for robustness
    setTimeout(() => {
        setPrompt('');
        dispatch({ type: 'RESET' });
        setIsResetting(false); // End reset state
    }, RESET_ANIMATION_DURATION_MS);
  }, [setDividerPosition, setPrompt]);
  
  const handleReusePrompt = useCallback((newPrompt: string) => {
    setPrompt(newPrompt);
    setIsPromptHighlighting(true);
    document.getElementById('prompt-input')?.focus();
    setTimeout(() => setIsPromptHighlighting(false), 900);
  }, [setPrompt]);

  // Memoize callbacks for performance optimization with React.memo
  const openHelpModal = useCallback(() => setIsHelpOpen(true), []);
  const openResetModal = useCallback(() => setIsResetModalOpen(true), []);


  return (
    <div className="h-screen flex flex-col bg-transparent transition-colors duration-normal">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {ariaLiveMessage}
      </div>

      <Header 
        onHelpClick={openHelpModal}
        onResetClick={openResetModal}
      />
      <main ref={mainContainerRef} className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col md:flex-row overflow-hidden gap-4 min-h-0">
        
        <div 
          id="prompt-panel"
          className={`flex flex-col flex-shrink-0 md:h-full md:min-h-0 transition-opacity duration-normal ${isResetting ? 'opacity-0' : 'opacity-100'}`}
          aria-busy={generationState.status === 'loading'}
        >
           <PromptInput 
            prompt={prompt}
            setPrompt={setPrompt}
            handleGenerate={handleGenerate}
            isLoading={generationState.status === 'loading'}
            isHighlighting={isPromptHighlighting}
           />
        </div>
        
        <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panels"
            tabIndex={0}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onKeyDown={handleDividerKeyDown}
            className="hidden md:flex flex-col justify-center items-center w-4 cursor-col-resize group focus:outline-none"
        >
            <div className={`w-1.5 h-12 rounded-full transition-colors ${isDragging ? 'bg-indigo-400' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 group-focus:bg-indigo-400'}`}>
                <GripVerticalIcon aria-hidden="true" className={`w-full h-full scale-50 transition-opacity duration-300 text-slate-500 dark:text-slate-400 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100'}`} />
            </div>
        </div>
        
        <div 
          id="output-panel"
          className={`flex flex-col flex-1 min-h-0 md:h-full transition-opacity duration-normal ${isResetting ? 'opacity-0' : 'opacity-100'}`}
          aria-busy={generationState.status === 'loading'}
        >
          <OutputDisplay
            response={generationState.response}
            isLoading={generationState.status === 'loading'}
            error={generationState.error}
            setPrompt={setPrompt}
            onReusePrompt={handleReusePrompt}
            prompt={prompt}
            onRetry={handleGenerate}
          />
        </div>
      </main>
      <Footer />
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