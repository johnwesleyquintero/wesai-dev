

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CopyIcon, CheckIcon } from '../Icons';

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
        <div className={`rounded-lg overflow-hidden border flex-1 flex flex-col min-h-0 transition-all duration-300 ${isCopied ? 'bg-green-400/10 dark:bg-green-500/10 border-green-500/50' : 'bg-slate-100 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/50'}`}>
            <div className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 border-b border-inherit">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">React Component (.tsx)</h3>
                <div className="relative group">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                        disabled={isCopied}
                    >
                        {isCopied ? (
                            <span className="flex items-center gap-2 text-green-600 dark:text-green-500 animate-scale-in">
                                <CheckIcon className="w-4 h-4" />
                                Copied!
                            </span>
                        ) : (
                            <>
                                <CopyIcon className="w-4 h-4" />
                                Copy
                            </>
                        )}
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

export default CodeBlock;