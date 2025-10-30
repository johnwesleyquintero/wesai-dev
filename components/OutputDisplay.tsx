import React, { useState, useCallback, useEffect, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { CodeOutput } from '../copilot/agent';
import { CopyIcon, CheckIcon, WesAILogoIcon, AlertTriangleIcon, EyeIcon, CodeIcon } from './Icons';

type Theme = 'light' | 'dark';
type ActiveTab = 'preview' | 'code';

// --- SUB-COMPONENTS ---

const PreviewPanel: React.FC<{ code: string; theme: Theme; onSandboxError: (message: string | null) => void }> = ({ code, theme, onSandboxError }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isSandboxReady, setIsSandboxReady] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow) {
                return;
            }
            if (event.data.type === 'SANDBOX_READY') {
                setIsSandboxReady(true);
                onSandboxError(null); // Clear previous errors on reload
            }
             if (event.data.type === 'RENDER_ERROR') {
                onSandboxError(event.data.payload.message);
            }
            if (event.data.type === 'RENDER_SUCCESS') {
                onSandboxError(null); // Clear error on successful render
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [onSandboxError]);
    
    // Post messages to the iframe when it's ready and when code/theme changes
    useEffect(() => {
        if (isSandboxReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'SET_THEME',
                payload: { theme }
            }, '*');
            iframeRef.current.contentWindow.postMessage({
                type: 'RENDER_CODE',
                payload: { code }
            }, '*');
        }
    }, [code, theme, isSandboxReady]);

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

    const handleCopy = useCallback(() => {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [code]);

    if (!code) return null;

    return (
        <div className="bg-slate-100 dark:bg-slate-900/70 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50 h-full flex flex-col">
            <div className="flex justify-between items-center bg-slate-200/80 dark:bg-slate-900 px-4 py-2 border-b border-slate-300/80 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">React Component (.tsx)</h3>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                    disabled={isCopied}
                >
                    {isCopied ? <CheckIcon className="text-green-500 w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-800 dark:text-slate-300 whitespace-pre overflow-auto"><code>{code}</code></pre>
        </div>
    );
};


const InitialState: React.FC<{ setPrompt: (prompt: string) => void }> = ({ setPrompt }) => {
    const examples = [
        "A responsive login form with a 'remember me' checkbox.",
        "A pricing card with 3 tiers, highlighting the 'Pro' plan.",
        "A testimonial slider with avatar images and quotes.",
    ];

    return (
        <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
            <WesAILogoIcon className="text-slate-300 dark:text-slate-700 mb-6 w-48 h-12" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Your AI Co-pilot for the Web</h3>
            <p className="max-w-md text-slate-500 mb-8">Start by describing a component, or try an example:</p>
            <div className="flex flex-col gap-3 w-full max-w-sm">
                {examples.map((example, i) => (
                     <button
                        key={i}
                        onClick={() => setPrompt(example)}
                        className="text-left p-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200 transform hover:scale-[1.03] border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md"
                    >
                        {example}
                    </button>
                ))}
            </div>
        </div>
    );
};


const LoadingState: React.FC = () => {
  const [message, setMessage] = useState('WesAI is warming up...');
  
  useEffect(() => {
    const messages = [
        "Analyzing your request...", 
        "Architecting the component...", 
        "Writing React code...",
        "Applying styles...",
        "Finalizing the component..."
    ];
    let index = 0;
    const intervalId = setInterval(() => {
      setMessage(messages[index]);
      index = (index + 1) % messages.length;
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-full text-center p-4">
      <LoadingSpinner />
      <p className="mt-4 text-slate-600 dark:text-slate-400">{message}</p>
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
                            <p className="text-sm mt-1">{error}</p>
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
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ response, isLoading, error, setPrompt, theme }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [sandboxError, setSandboxError] = useState<string | null>(null);

  useEffect(() => {
    // When a new response comes in, switch to the preview tab and clear old errors
    if (response) {
      setActiveTab('preview');
      setSandboxError(null);
    }
  }, [response]);
  
  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorDisplay error={error} title="Generation Error" />;
    if (response) {
      if (activeTab === 'preview') {
          return (
            <>
              <PreviewPanel code={response.react} theme={theme} onSandboxError={setSandboxError} />
              {sandboxError && (
                 <div className="absolute bottom-0 left-0 right-0 p-2">
                    <ErrorDisplay error={sandboxError} title="Preview Error" />
                 </div>
              )}
            </>
          );
      }
      return (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-md h-full overflow-hidden">
          <CodeBlock code={response.react} />
        </div>
      );
    }
    return <InitialState setPrompt={setPrompt} />;
  };

  const contentKey = isLoading ? 'loading' : error ? 'error' : response ? `${activeTab}-${response.react.length}` : 'initial';

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col h-full">
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 rounded-t-lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 px-2">Output</h2>
            {response && !isLoading && !error && (
                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-md">
                     <button 
                        onClick={() => setActiveTab('preview')}
                        className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}
                     >
                        <EyeIcon className="w-4 h-4" />
                        Preview
                     </button>
                     <button 
                        onClick={() => setActiveTab('code')}
                        className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-colors ${activeTab === 'code' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'}`}
                     >
                        <CodeIcon className="w-4 h-4" />
                        Code
                     </button>
                </div>
            )}
      </div>
      <div key={contentKey} className="flex-grow relative animate-fade-in min-h-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputDisplay;
