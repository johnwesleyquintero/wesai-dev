import React, { useMemo, useCallback, useId } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import { useToast } from '../../contexts/ToastContext';
import { CopyIcon, DownloadIcon, CheckIcon, WrapTextIcon, FontSizeIncreaseIcon, FontSizeDecreaseIcon } from '../Icons';
import { useActionFeedback } from '../../hooks/useActionFeedback';
import { useSettings } from '../../hooks/useSettings';
import { TOOLTIP_CLASSES } from '../../constants';

// Register the TSX language for highlighting.
// This only needs to be done once.
hljs.registerLanguage('tsx', typescript);

interface CodeBlockProps {
    code: string;
    prompt: string;
}

const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 20;

const CodeBlock: React.FC<CodeBlockProps> = ({ code, prompt }) => {
    const { addToast } = useToast();
    const { isActionDone: isCopied, trigger: triggerCopied } = useActionFeedback();
    const { isActionDone: isDownloaded, trigger: triggerDownloaded } = useActionFeedback();
    const [settings, setSettings] = useSettings();

    const decreaseFontTooltipId = useId();
    const increaseFontTooltipId = useId();
    const wrapTextTooltipId = useId();
    const downloadTooltipId = useId();
    const copyTooltipId = useId();


    const highlightedLines = useMemo(() => {
        if (!code) return [];

        const escapeHtml = (unsafe: string) => 
            unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        
        try {
            const highlightedCode = hljs.highlight(code, { language: 'tsx' }).value;
            return highlightedCode.split('\n');
        } catch (error) {
            console.error("Code highlighting failed:", error);
            return code.split('\n').map(line => escapeHtml(line));
        }
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
                            onClick={() => setSettings(s => ({ ...s, fontSize: Math.max(MIN_FONT_SIZE, s.fontSize - 1) }))}
                            className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            aria-label="Decrease font size"
                            aria-describedby={decreaseFontTooltipId}
                        >
                            <FontSizeDecreaseIcon className="w-5 h-5" />
                        </button>
                        <div id={decreaseFontTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
                            Decrease Font Size
                        </div>
                    </div>
                     <div className="relative group">
                        <button
                            onClick={() => setSettings(s => ({ ...s, fontSize: Math.min(MAX_FONT_SIZE, s.fontSize + 1) }))}
                            className="p-1.5 rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            aria-label="Increase font size"
                            aria-describedby={increaseFontTooltipId}
                        >
                            <FontSizeIncreaseIcon className="w-5 h-5" />
                        </button>
                         <div id={increaseFontTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
                            Increase Font Size
                        </div>
                    </div>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="relative group">
                        <button
                            onClick={() => setSettings(s => ({ ...s, lineWrapEnabled: !s.lineWrapEnabled }))}
                            aria-label={settings.lineWrapEnabled ? 'Disable line wrapping' : 'Enable line wrapping'}
                            aria-describedby={wrapTextTooltipId}
                            className={`flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${settings.lineWrapEnabled ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : ''}`}
                        >
                            <WrapTextIcon className="w-4 h-4" />
                        </button>
                        <div id={wrapTextTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} right-0`}>
                            {settings.lineWrapEnabled ? 'Disable Line Wrapping' : 'Enable Line Wrapping'}
                        </div>
                    </div>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="relative group">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloaded}
                            aria-describedby={downloadTooltipId}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:text-green-500 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
                        >
                            {isDownloaded ? <CheckIcon className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                            {isDownloaded ? 'Downloaded' : 'Download'}
                        </button>
                        <div id={downloadTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} right-0`}>
                            Download File
                        </div>
                    </div>
                     <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="relative group">
                        <button
                            onClick={handleCopy}
                            disabled={isCopied}
                            aria-describedby={copyTooltipId}
                            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:text-green-500 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
                        >
                            {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                            {isCopied ? 'Copied' : 'Copy'}
                        </button>
                        <div id={copyTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} right-0`}>
                            Copy Code
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto text-sm" style={{ fontSize: `${settings.fontSize}px` }}>
                 <pre className={`flex-1 !m-0 !p-0 ${settings.lineWrapEnabled ? 'whitespace-pre-wrap break-words' : ''}`}>
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