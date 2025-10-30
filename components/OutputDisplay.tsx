import React, { useState, useMemo, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { CodeOutput } from '../copilot/agent';

// --- ICONS ---
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const CubeIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);

const AlertTriangleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 dark:text-red-400 mr-3 h-6 w-6">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4"/>
        <path d="M12 17h.01"/>
    </svg>
);


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
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between items-center bg-slate-200 dark:bg-slate-900 px-4 py-2 rounded-t-md border-b border-slate-300 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{language}</h3>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                    disabled={isCopied}
                >
                    {isCopied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-b-md text-sm text-slate-800 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto"><code>{code}</code></pre>
        </div>
    );
};

const InitialState: React.FC = () => (
    <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center p-4">
        <CubeIcon className="text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Design Canvas</h3>
        <p className="max-w-xs text-slate-500">From prompt to prototype. Describe an interface and watch it materialize.</p>
    </div>
);


// --- MAIN COMPONENT ---
interface OutputDisplayProps {
  response: CodeOutput | null;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

type Tab = 'preview' | 'code';

const OutputDisplay: React.FC<OutputDisplayProps> = ({ response, isLoading, error, theme }) => {
  const [activeTab, setActiveTab] = useState<Tab>('preview');

  const srcDoc = useMemo(() => {
    if (!response) return '';
    const bodyColor = theme === 'dark' ? '#E2E8F0' : '#111827';
    return `
      <html>
        <head>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
              color: ${bodyColor};
              background-color: transparent;
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
  
  const checkerboardStyle = useMemo(() => {
    const color = theme === 'dark' ? '#334155' : '#e2e8f0'; // slate-700 or slate-200
    return {
      backgroundImage: `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${color} 75%), linear-gradient(-45deg, transparent 75%, ${color} 75%)`,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    };
  }, [theme]);


  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full bg-slate-100/50 dark:bg-slate-800/50">
                <LoadingSpinner />
            </div>
        );
    }
    if (error) {
      return (
        <div className="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-md m-4 flex items-start">
            <AlertTriangleIcon/>
            <div>
                <p className="font-bold text-red-800 dark:text-red-300">Generation Error</p>
                <p>{error}</p>
            </div>
        </div>
      );
    }
    if (response) {
      return (
        <div className="flex flex-col h-full">
          {activeTab === 'preview' ? (
            <div style={checkerboardStyle} className="w-full h-full bg-white dark:bg-slate-800 rounded-b-md">
                <iframe
                srcDoc={srcDoc}
                title="Preview"
                sandbox="allow-scripts"
                className="w-full h-full border-0 bg-transparent"
                />
            </div>
          ) : (
            <div className="flex-grow overflow-auto p-4 bg-slate-100/50 dark:bg-slate-800/50 rounded-b-md">
                <CodeBlock language="HTML" code={response.html} />
                <CodeBlock language="CSS" code={response.css} />
                <CodeBlock language="JavaScript" code={response.js} />
            </div>
          )}
        </div>
      );
    }
    return <InitialState />;
  };

  const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );

  const contentKey = isLoading ? 'loading' : error ? 'error' : response ? 'response' : 'initial';

  return (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col h-full">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-900/50 p-2 rounded-t-lg">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 px-2">Output</h2>
            {response && (
                <nav className="flex items-center gap-1">
                    <TabButton tab="preview" label="Preview" />
                    <TabButton tab="code" label="Code" />
                </nav>
            )}
      </div>
      <div key={contentKey} className="flex-grow relative animate-fade-in">
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputDisplay;