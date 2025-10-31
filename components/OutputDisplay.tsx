import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CodeOutput } from '../copilot/agent';
import { CopyIcon, CheckIcon, EyeIcon, CodeIcon, RotateCcwIcon, CubeIcon } from './Icons';
import CodeBlock from './output/CodeBlock';
import ErrorDisplay from './output/ErrorDisplay';
import InitialState from './output/InitialState';
import LoadingState from './output/LoadingState';
import PreviewPanel from './output/PreviewPanel';

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
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ response, isLoading, error, setPrompt, onReusePrompt, prompt }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isReuseCopied, setIsReuseCopied] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [gliderStyle, setGliderStyle] = useState({});

  useLayoutEffect(() => {
    const activeTabIndex = activeTab === 'preview' ? 0 : 1;
    const activeTabEl = tabsRef.current[activeTabIndex];
    if (activeTabEl) {
      setGliderStyle({
        width: activeTabEl.offsetWidth,
        transform: `translateX(${activeTabEl.offsetLeft}px)`,
      });
    }
  }, [activeTab, response]);

  const handleReusePrompt = useCallback(() => {
    if (prompt) {
        onReusePrompt(prompt);
        setIsReuseCopied(true);
        setTimeout(() => setIsReuseCopied(false), 2000);
    }
  }, [prompt, onReusePrompt]);

  const handleCopyPrompt = useCallback(() => {
    if (prompt) {
        navigator.clipboard.writeText(prompt);
        setIsPromptCopied(true);
        setTimeout(() => setIsPromptCopied(false), 2000);
    }
  }, [prompt]);


  // When a new response comes in, switch to the preview tab and listen for sandbox errors
  useEffect(() => {
    if (response) {
      setActiveTab('preview');
    }
    
    if (!response) return;

    const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'RENDER_ERROR' && event.data.payload.message) {
            setPreviewError(event.data.payload.message);
        }
    };

    window.addEventListener('message', handleMessage);
    return () => {
        window.removeEventListener('message', handleMessage);
    };
  }, [response]);

  // Reset preview error on new generation
  useEffect(() => {
    if (isLoading) {
        setPreviewError(null);
    }
  }, [isLoading]);
  
  if (isLoading) {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col h-full shadow-md">
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 p-2 rounded-t-lg">
                <div className="flex items-center gap-2 pl-2">
                  <CubeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Output</h2>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse-indicator"></div>
                </div>
            </div>
            <div className="flex-grow relative min-h-0">
                <LoadingState prompt={prompt} />
            </div>
        </div>
    );
  }
  
  const renderContent = () => {
    if (error) return <ErrorDisplay error={error} title="Generation Error" />;
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
          return <PreviewPanel code={response.react} theme={theme} />;
      }
      return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-b-md h-full flex flex-col">
          <CodeBlock code={response.react} />
        </div>
      );
    }
    return <InitialState setPrompt={setPrompt} />;
  };

  const contentKey = error ? 'error' : response ? `${activeTab}-${response.react.length}-${previewError}` : 'initial';

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col h-full shadow-md">
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 p-2 rounded-t-lg">
            <div className="flex items-center gap-2 min-w-0 pl-2">
                <CubeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                <h2 id="output-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-200 flex-shrink-0">Output</h2>
                {response && !error && (
                    <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-2 min-w-0">
                        <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap fade-out-right" title={prompt}>
                            {prompt}
                        </p>
                        <div className="relative group flex-shrink-0">
                            <button
                                onClick={handleCopyPrompt}
                                className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-200"
                                aria-label="Copy this prompt"
                            >
                                {isPromptCopied ? <CheckIcon className="w-4 h-4 text-green-500 animate-scale-in" /> : <CopyIcon className="w-4 h-4" />}
                            </button>
                             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                {isPromptCopied ? 'Copied!' : 'Copy Prompt'}
                            </div>
                        </div>
                        <div className="relative group flex-shrink-0">
                            <button
                                onClick={handleReusePrompt}
                                className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-200"
                                aria-label="Reuse this prompt"
                            >
                                {isReuseCopied ? <CheckIcon className="w-4 h-4 text-green-500 animate-scale-in" /> : <RotateCcwIcon className="w-4 h-4" />}
                            </button>
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                {isReuseCopied ? 'Copied to Input!' : 'Reuse Prompt'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {response && !error && (
                <div role="tablist" aria-labelledby="output-heading" className="relative flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-md flex-shrink-0">
                     <div
                        className="absolute bg-white dark:bg-slate-700 shadow-sm rounded-md h-[calc(100%-8px)] transition-all duration-300 ease-out"
                        style={gliderStyle}
                     />
                     <button
                        id="tab-preview"
                        role="tab"
                        aria-controls="tabpanel-output"
                        aria-selected={activeTab === 'preview'}
                        ref={el => { tabsRef.current[0] = el; }}
                        onClick={() => setActiveTab('preview')}
                        className={`relative z-10 flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'preview' ? 'text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                     >
                        <EyeIcon className="w-4 h-4" />
                        Preview
                     </button>
                     <button
                        id="tab-code"
                        role="tab"
                        aria-controls="tabpanel-output"
                        aria-selected={activeTab === 'code'}
                        ref={el => { tabsRef.current[1] = el; }}
                        onClick={() => setActiveTab('code')}
                        className={`relative z-10 flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'code' ? 'text-indigo-600 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
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
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputDisplay;