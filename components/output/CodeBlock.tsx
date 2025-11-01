import React, { useMemo, useCallback, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CopyIcon, DownloadIcon, CheckIcon, WrapTextIcon, FontSizeIncreaseIcon, FontSizeDecreaseIcon } from '../Icons';
import { useActionFeedback } from '../../hooks/useActionFeedback';
import usePersistentState from '../../hooks/usePersistentState';
import { TOOLTIP_CLASSES, LOCAL_STORAGE_KEYS } from '../../constants';

interface CodeBlockProps {
    code: string;
    prompt: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, prompt }) => {
    const { addToast } = useToast();
    const { isActionDone: isCopied, trigger: triggerCopied } = useActionFeedback();
    const { isActionDone: isDownloaded, trigger: triggerDownloaded } = useActionFeedback();
    const [isLineWrapEnabled, setIsLineWrapEnabled] = usePersistentState(LOCAL_STORAGE_KEYS.LINE_WRAP_ENABLED, false);
    const [fontSize, setFontSize] = usePersistentState(LOCAL_STORAGE_KEYS.CODE_FONT_SIZE, 14);


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
        <div className={`overflow-hidden flex flex-col min-h-0 bg-[#FAFAFA] dark:bg-[#282C34] transition-colors duration-normal`}>
            <div className="flex justify-between items-center bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">React Component (.tsx)</h3>
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <button
                            onClick={() => setFontSize(size => Math.max(10, size - 1))}
                            className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            aria-label="Decrease font size"
                        >
                            <FontSizeDecreaseIcon className="w-5 h-5" />
                        </button>
                        <div className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
                            Decrease Font Size
                        </div>
                    </div>
                     <div className="relative group">
                        <button
                            onClick={() => setFontSize(size => Math.min(20, size + 1))}
                            className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            aria-label="Increase font size"
                        >
                            <FontSizeIncreaseIcon className="w-5 h-5" />
                        </button>
                         <div className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
                            Increase Font Size
                        </div>
                    </div>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="relative group">
                        <button
                            onClick={() => setIsLineWrapEnabled(!isLineWrapEnabled)}
                            className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${isLineWrapEnabled ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : ''}`}
                        >
                            <WrapTextIcon className="w-4 h-4" />
                        </button>
                        <div className={`${TOOLTIP_CLASSES} right-0`}>
                            {isLineWrapEnabled ? 'Disable Line Wrapping' : 'Enable Line Wrapping'}
                        </div>
                    </div>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="relative group">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloaded}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:text-green-500 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
                        >
                            {isDownloaded ? <CheckIcon className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                            {isDownloaded ? 'Downloaded' : 'Download'}
                        </button>
                        <div className={`${TOOLTIP_CLASSES} right-0`}>
                            Download File
                        </div>
                    </div>
                     <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="relative group">
                        <button
                            onClick={handleCopy}
                            disabled={isCopied}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:text-green-500 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
                        >
                            {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                            {isCopied ? 'Copied' : 'Copy'}
                        </button>
                        <div className={`${TOOLTIP_CLASSES} right-0`}>
                            Copy Code
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto text-sm" style={{ fontSize: `${fontSize}px` }}>
                 <pre className={`flex-1 !m-0 !p-0 ${isLineWrapEnabled ? 'whitespace-pre-wrap break-words' : ''}`}>
                    <code className="language-tsx hljs">
                       {highlightedLines.map((line, index) => (
                            <div key={index} className="line-container">
                                <span aria-hidden="true" className="line-number-cell"></span>
                                <span className="line-content-cell" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
                            </div>
                        ))}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default CodeBlock;