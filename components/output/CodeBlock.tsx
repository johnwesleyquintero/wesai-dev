



import React, { useMemo, useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CopyIcon, DownloadIcon, CheckIcon } from '../Icons';
import { useActionFeedback } from '../../hooks/useActionFeedback';

interface CodeBlockProps {
    code: string;
    prompt: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, prompt }) => {
    const { addToast } = useToast();
    const { isActionDone: isCopied, trigger: triggerCopied } = useActionFeedback();
    const { isActionDone: isDownloaded, trigger: triggerDownloaded } = useActionFeedback();


    const highlightedLines = useMemo(() => {
        if (!code || !window.hljs) return [];
        const highlightedCode = window.hljs.highlight(code, { language: 'tsx' }).value;
        return highlightedCode.split('\n');
    }, [code]);

    const handleCopy = useCallback(() => {
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            addToast('Code copied to clipboard');
            triggerCopied();
        });
    }, [code, addToast, triggerCopied]);

    const handleDownload = useCallback(() => {
        if (!code || !prompt) return;
        const safeName = prompt
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50) || 'component';
        const filename = `${safeName}.tsx`;
        const blob = new Blob([code], { type: 'text/tsx;charset=utf-8,' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addToast('File download started');
        triggerDownloaded();
    }, [code, prompt, addToast, triggerDownloaded]);
    
    if (!code) return null;

    return (
        <div className={`overflow-hidden flex flex-col min-h-0 bg-[#FAFAFA] dark:bg-[#282C34] transition-colors duration-300`}>
            <div className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">React Component (.tsx)</h3>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloaded}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:text-green-500"
                        >
                            {isDownloaded ? <CheckIcon className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                            {isDownloaded ? 'Downloaded' : 'Download'}
                        </button>
                        <div className="absolute bottom-full mb-2 right-0 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Download File
                        </div>
                    </div>
                     <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="relative group">
                        <button
                            onClick={handleCopy}
                            disabled={isCopied}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:text-green-500"
                        >
                            {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                            {isCopied ? 'Copied' : 'Copy'}
                        </button>
                        <div className="absolute bottom-full mb-2 right-0 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Copy Code
                        </div>
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