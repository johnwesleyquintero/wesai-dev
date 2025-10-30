import React, { useState, useMemo, useCallback, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { CodeOutput } from '../copilot/agent';
import { CopyIcon, CheckIcon, WesAILogoIcon, AlertTriangleIcon, CopyAllIcon } from './Icons';


// --- SUB-COMPONENTS ---
interface CodeBlockProps {
    language: string;
    code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
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
        <div className="mb-4 last:mb-0 bg-slate-100 dark:bg-slate-900/70 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center bg-slate-200/80 dark:bg-slate-900 px-4 py-2 border-b border-slate-300/80 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{language}</h3>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                    disabled={isCopied}
                >
                    {isCopied ? <CheckIcon className="text-green-500 w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="bg-slate-50 dark:bg-slate-800 p-4 text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto"><code>{code}</code></pre>
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
        <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center p-4">
            <WesAILogoIcon className="text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Your AI Co-pilot for the Web</h3>
            <p className="max-w-xs text-slate-500 mb-6">Start by describing a component, or try an example:</p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
                {examples.map((example, i) => (
                    <button
                        key={i}
                        onClick={() => setPrompt(example)}
                        className="text-left p-2.5 bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-md text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-transform hover:scale-[1.02]"
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
        "Generating HTML...", 
        "Styling with CSS...", 
        "Adding JavaScript interactivity..."
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

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => {
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
                            <p className="font-bold text-red-800 dark:text-red-300">Generation Error</p>
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
  theme: 'light' | 'dark';
  setPrompt: (prompt: string) => void;
}

type Tab = 'preview' | 'code';

const OutputDisplay: React.FC<OutputDisplayProps> = ({ response, isLoading, error, theme, setPrompt }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [isAllCopied, setIsAllCopied] = useState(false);

  const srcDoc = useMemo(() => {
    if (!response) return '';
    return `
      <html>
        <head>
          <style>
            :root {
              --text-color: ${theme === 'dark' ? '#E2E8F0' : '#111827'};
              --bg-color: transparent;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
              color: var(--text-color);
              background-color: var(--bg-color);
            }
            ${response.css}
          </style>
        </head>
        <body class="p-4">
          ${response.html}
          <script>${response.js}</script>
        </body>
      </html>
    `;
  }, [response, theme]);
  
  const handleCopyAll = useCallback(() => {
    if (!response) return;
    const allCode = `<!-- HTML -->\n${response.html}\n\n/* CSS */\n${response.css}\n\n// JavaScript\n${response.js}`;
    navigator.clipboard.writeText(allCode).then(() => {
        setIsAllCopied(true);
        setTimeout(() => setIsAllCopied(false), 2000);
    });
  }, [response]);

  useEffect(() => {
    // When a new response comes in, reset the copy all button
    if (response) {
        setIsAllCopied(false);
    }
  }, [response]);


  const renderContent = () => {
    if (isLoading) {
        return <LoadingState />;
    }
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    if (response) {
      return (
        <div className="flex flex-col h-full">
          {activeTab === 'preview' ? (
             <div className="w-full h-full bg-white dark:bg-slate-900 rounded-b-md">
                <iframe
                srcDoc={srcDoc}
                title="Preview"
                sandbox="allow-scripts"
                className="w-full h-full border-0 bg-transparent"
                />
            </div>
          ) : (
            <div className="flex-grow overflow-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-md">
                <CodeBlock language="HTML" code={response.html} />
                <CodeBlock language="CSS" code={response.css} />
                <CodeBlock language="JavaScript" code={response.js} />
            </div>
          )}
        </div>
      );
    }
    return <InitialState setPrompt={setPrompt} />;
  };

  const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 ${
        activeTab === tab
          ? 'bg-white dark:bg-slate-700/80 text-indigo-600 dark:text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  const contentKey = isLoading ? 'loading' : error ? 'error' : response ? 'response' : 'initial';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col h-full">
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 p-2 rounded-t-lg">
            <div className="flex items-center gap-2">
                 <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 px-2">Output</h2>
                 {response && activeTab === 'code' && (
                    <button
                        onClick={handleCopyAll}
                        className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-300/50 dark:hover:bg-slate-700/50 disabled:opacity-50"
                        disabled={isAllCopied}
                        aria-label="Copy all code"
                    >
                        {isAllCopied ? <CheckIcon className="text-green-500 w-4 h-4" /> : <CopyAllIcon className="w-4 h-4" />}
                        {isAllCopied ? 'Copied All' : 'Copy All'}
                    </button>
                )}
            </div>
            {response && (
                <nav className="flex items-center gap-1 bg-slate-300/50 dark:bg-slate-800/50 p-1 rounded-lg">
                    <TabButton tab="preview" label="Preview" />
                    <TabButton tab="code" label="Code" />
                </nav>
            )}
      </div>
      <div key={contentKey} className="flex-grow relative animate-fade-in min-h-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputDisplay;