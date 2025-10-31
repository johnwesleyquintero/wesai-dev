

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CopyIcon, CheckIcon } from '../Icons';

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [isCopied, setIsCopied] = useState(false);

    const highlightedLines = useMemo(() => {
        if (!code || !window.hljs) return [];
        // Highlight the entire block at once for correct syntax context
        const highlightedCode = window.hljs.highlight(code, { language: 'tsx' }).value;
        // Split the highlighted HTML into lines
        return highlightedCode.split('\n');
    }, [code]);

    const handleCopy = useCallback(() => {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [code]);
    
    if (!code) return null;

    // Use specific background colors that match the atom-one-light and atom-one-dark themes.
    return (
        <div className={`overflow-hidden flex flex-col min-h-0 bg-[#FAFAFA] dark:bg-[#282C34] transition-colors duration-300`}>
            <div className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700/50">
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
                    <div aria-hidden="true" className="sticky top-0 left-0 z-10 select-none text-right px-4 text-slate-500 dark:text-slate-600 bg-inherit" style={{ lineHeight: '1.6', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                        {highlightedLines.map((_, index) => (
                            <div key={index}>{index + 1}</div>
                        ))}
                    </div>
                    <pre className="flex-1 !m-0 !p-0"><code className="language-tsx hljs">
                       {highlightedLines.map((line, index) => (
                            <div
                                key={index}
                                className="px-4 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                                dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                                style={{ lineHeight: '1.6' }}
                            />
                        ))}
                    </code></pre>
                 </div>
            </div>
        </div>
    );
};

export default CodeBlock;