

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CodeOutput } from '../copilot/agent';
import { EyeIcon, CodeIcon, CubeIcon } from './Icons';
import CodeBlock from './output/CodeBlock';
import ErrorDisplay from './output/ErrorDisplay';
import InitialState from './output/InitialState';
import LoadingState from './output/LoadingState';
import PreviewPanel from './output/PreviewPanel';
import GenerationHeader from './output/GenerationHeader';
import ReadyState from './output/ReadyState';

type ActiveTab = 'preview' | 'code';

// Add hljs to the window object for TypeScript
declare global {
    interface Window { hljs: any; }
}

// --- MAIN COMPONENT ---
interface OutputDisplayProps {
  response: CodeOutput | null;
  isLoading: boolean;
  error: string | null;
  setPrompt: (prompt: string) => void;
  onReusePrompt: (prompt: string) => void;
  prompt: string;
  onRetry?: () => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ response, isLoading, error, setPrompt, onReusePrompt, prompt, onRetry }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  // FIX: Explicitly initialize useRef with undefined to fix "Expected 1 arguments, but got 0" runtime error.
  const prevActiveTabRef = useRef<ActiveTab | undefined>(undefined);
  const [gliderStyle, setGliderStyle] = useState({});

  // Memoize the style calculation to avoid re-creating the function on every render.
  const updateGliderStyle = useCallback(() => {
    const activeTabIndex = activeTab === 'preview' ? 0 : 1;
    const activeTabEl = tabsRef.current[activeTabIndex];
    if (activeTabEl) {
        setGliderStyle({
            width: activeTabEl.offsetWidth,
            transform: `translateX(${activeTabEl.offsetLeft}px)`,
        });
    }
  }, [activeTab]);

  // useLayoutEffect is best for DOM measurements to avoid visual flicker.
  // This effect now runs when the active tab changes AND listens for window resize events.
  useLayoutEffect(() => {
    updateGliderStyle();

    window.addEventListener('resize', updateGliderStyle);
    return () => {
        window.removeEventListener('resize', updateGliderStyle);
    };
  }, [updateGliderStyle]);


  // When a new response comes in, switch to the preview tab.
  useEffect(() => {
    if (response) {
      setActiveTab('preview');
    }
  }, [response]);
  
  // Reset preview error on new generation or when switching away from the preview tab
  useEffect(() => {
    if (isLoading) {
        setPreviewError(null);
    }
    // If we're navigating away from the preview tab, clear any errors.
    if (prevActiveTabRef.current === 'preview' && activeTab !== 'preview') {
        setPreviewError(null);
    }
    prevActiveTabRef.current = activeTab;
  }, [isLoading, activeTab]);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent) => {
    const tabs = ['preview', 'code'] as ActiveTab[];
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex = -1; // Use -1 to indicate no change

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    if (nextIndex !== -1) {
      setActiveTab(tabs[nextIndex]);
      tabsRef.current[nextIndex]?.focus();
    }
  }, [activeTab]);
  
  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorDisplay error={error} title="Generation Error" onRetry={onRetry} />;
    if (response) {
      if (activeTab === 'preview') {
          if (previewError) {
            return (
                <ErrorDisplay 
                    error={`The generated code could not be rendered. Check the 'Code' tab for details.\n\nDetails: ${previewError}`}
                    title="Preview Error" 
                />
            );
          }
          return <PreviewPanel code={response.react} theme={theme} onError={setPreviewError} />;
      }
      return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-b-md h-full flex flex-col">
          <CodeBlock code={response.react} prompt={prompt} />
        </div>
      );
    }
    if (prompt) {
        return <ReadyState />;
    }
    return <InitialState setPrompt={setPrompt} />;
  };

  const contentKey = error ? 'error' : response ? `${activeTab}-${response.react.length}` : 'initial';

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 ring-1 ring-black/5 dark:ring-white/10 rounded-lg flex flex-col h-full shadow-md">
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 p-2 rounded-t-lg">
            <div className="flex flex-1 items-center gap-2 min-w-0 pl-2">
                <CubeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                <h2 id="output-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-200 flex-shrink-0">Output</h2>
                {response && !error && (
                    <GenerationHeader
                        prompt={prompt}
                        response={response}
                        onReusePrompt={onReusePrompt}
                    />
                )}
            </div>
            {response && !error && (
                <div 
                    role="tablist" 
                    aria-labelledby="output-heading" 
                    className="relative flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-md flex-shrink-0"
                    onKeyDown={handleTabKeyDown}
                >
                     <div
                        className="absolute bg-white dark:bg-slate-700 shadow-sm rounded-md h-[calc(100%-8px)] transition-all duration-normal ease-out-quad"
                        style={gliderStyle}
                     />
                     <button
                        id="tab-preview"
                        role="tab"
                        aria-controls="tabpanel-output"
                        aria-selected={activeTab === 'preview'}
                        tabIndex={activeTab === 'preview' ? 0 : -1}
                        ref={el => { tabsRef.current[0] = el; }}
                        onClick={() => setActiveTab('preview')}
                        className={`relative z-10 flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'preview' ? 'text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                     >
                        <EyeIcon className="w-4 h-4" />
                        Preview
                     </button>
                     <button
                        id="tab-code"
                        role="tab"
                        aria-controls="tabpanel-output"
                        aria-selected={activeTab === 'code'}
                        tabIndex={activeTab === 'code' ? 0 : -1}
                        ref={el => { tabsRef.current[1] = el; }}
                        onClick={() => setActiveTab('code')}
                        className={`relative z-10 flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'code' ? 'text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                     >
                        <CodeIcon className="w-4 h-4" />
                        Code
                     </button>
                </div>
            )}
      </div>
      <div 
        key={contentKey} 
        id="tabpanel-output"
        role="tabpanel"
        aria-labelledby={activeTab === 'preview' ? 'tab-preview' : 'tab-code'}
        className="flex-grow relative animate-fade-in min-h-0"
      >
        {isLoading && (
            <div className="absolute top-0 left-0 w-full h-0.5 z-10 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 animate-indeterminate-progress bg-[length:200%_100%]"></div>
            </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputDisplay;