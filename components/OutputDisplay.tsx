

import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { CodeOutput } from '../copilot/agent';
import { CopyIcon, CheckIcon, AlertTriangleIcon, EyeIcon, CodeIcon, InitialStateLogoIcon, WesAILogoSpinnerIcon } from './Icons';
import { quickStartPrompts, PromptTemplate } from '../copilot/prompts';
import { getPromptIcon } from './promptUtils';

type Theme = 'light' | 'dark';
type ActiveTab = 'preview' | 'code';

// Add hljs to the window object for TypeScript
declare global {
    interface Window { hljs: any; }
}


// --- SUB-COMPONENTS ---

const PreviewPanel: React.FC<{ code: string; theme: Theme; }> = ({ code, theme }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isSandboxReady, setIsSandboxReady] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source === iframeRef.current?.contentWindow && event.data.type === 'SANDBOX_READY') {
                setIsSandboxReady(true);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);
    
    // Decouple theme updates from code rendering to prevent unnecessary re-renders in the sandbox.
    useEffect(() => {
        if (isSandboxReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'RENDER_CODE',
                payload: { code }
            }, '*');
        }
    }, [code, isSandboxReady]);

    useEffect(() => {
        if (isSandboxReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'SET_THEME',
                payload: { theme }
            }, '*');
        }
    }, [theme, isSandboxReady]);

    return (
        <iframe
            ref={iframeRef}
            src="/sandbox.html"
            title="Component Preview"
            className="w-full h-full border-0 bg-transparent"
            sandbox="allow-scripts"
        />
    );
};


const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [isCopied, setIsCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        setLines(code.split('\n'));
    }, [code]);

    const handleCopy = useCallback(() => {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [code]);
    
    useEffect(() => {
        if (codeRef.current && window.hljs) {
            window.hljs.highlightElement(codeRef.current);
        }
    }, [code]);

    if (!code) return null;

    return (
        <div className={`bg-slate-100 dark:bg-slate-900/70 rounded-lg overflow-hidden border flex-1 flex flex-col min-h-0 transition-all duration-300 ${isCopied ? 'border-green-500/50 ring-2 ring-green-500/20' : 'border-slate-200 dark:border-slate-700/50'}`}>
            <div className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 border-b border-inherit">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">React Component (.tsx)</h3>
                <div className="relative group">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                        disabled={isCopied}
                    >
                        {isCopied ? <CheckIcon className="text-green-500 w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <div className="absolute bottom-full mb-2 right-0 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isCopied ? 'Copied!' : 'Copy Code'}
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto text-sm">
                 <div className="flex items-start">
                    <div aria-hidden="true" className="sticky top-0 left-0 z-10 select-none text-right px-4 text-slate-500 dark:text-slate-600 bg-slate-200/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700/50" style={{ lineHeight: '1.6', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                        {lines.map((_, index) => (
                            <div key={index}>{index + 1}</div>
                        ))}
                    </div>
                    <pre className="flex-1 whitespace-pre !m-0 !p-0"><code ref={codeRef} className="language-tsx">{code}</code></pre>
                 </div>
            </div>
        </div>
    );
};


const InitialState: React.FC<{ setPrompt: (prompt: string) => void }> = ({ setPrompt }) => {
    return (
        <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
            <InitialStateLogoIcon className="w-24 h-24 mb-6" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Your AI Co-pilot for the Web</h3>
            <p className="max-w-md text-slate-500 dark:text-slate-400 mb-8">Describe a component, or get started with an example:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {quickStartPrompts.map((example) => (
                     <button
                        key={example.title}
                        onClick={() => setPrompt(example.prompt)}
                        className="text-center p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200 transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20 flex flex-col items-center gap-3"
                    >
                        {getPromptIcon(example.key, 'w-6 h-6')}
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{example.title}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{example.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const LOADING_MESSAGES = [
    "WesAI is thinking...",
    "Architecting your component...",
    "Polishing the pixels...",
    "Generating brilliance..."
];

const LoadingState: React.FC<{ prompt: string }> = ({ prompt }) => {
    const [message, setMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % LOADING_MESSAGES.length;
            setMessage(LOADING_MESSAGES[index]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
             {prompt && (
                <div className="w-full max-w-xl mb-8 p-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-left">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Generating:</span>
                        <span className="line-clamp-2 ml-1">{prompt}</span>
                    </p>
                    <div className="mt-3 w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-indeterminate-progress"></div>
                    </div>
                </div>
            )}
            <WesAILogoSpinnerIcon className="w-24 h-24" />
            <p className="mt-6 text-lg font-medium text-slate-600 dark:text-slate-400 transition-all duration-500 animate-fade-in">{message}</p>
        </div>
    );
};


const ErrorDisplay: React.FC<{ error: string; title: string; }> = ({ error, title }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopyError = useCallback(() => {
      navigator.clipboard.writeText(error).then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      });
    }, [error]);

    return (
        <div className="p-4">
            <div className="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                    <div className="flex">
                        <AlertTriangleIcon className="text-red-500 dark:text-red-400 mr-3 h-6 w-6 flex-shrink-0"/>
                        <div>
                            <p className="font-bold text-red-800 dark:text-red-300">{title}</p>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCopyError}
                        className="ml-4 flex-shrink-0 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-400/20 disabled:opacity-50"
                        disabled={isCopied}
                    >
                        {isCopied ? <CheckIcon className="text-green-500 w-4 h-4"/> : <CopyIcon className="w-4 h-4" />}
                        {isCopied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
interface OutputDisplayProps {
  response: CodeOutput | null;
  isLoading: boolean;
  error: string | null;
  setPrompt: (prompt: string) => void;
  theme: Theme;
  prompt: string;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ response, isLoading, error, setPrompt, theme, prompt }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [previewError, setPreviewError] = useState<string | null>(null);
  
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
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 px-2">Output</h2>
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
            <h2 id="output-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-200 px-2">Output</h2>
            {response && !error && (
                <div role="tablist" aria-labelledby="output-heading" className="relative flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-md">
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