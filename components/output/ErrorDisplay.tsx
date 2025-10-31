import React, { useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { AlertTriangleIcon, CopyIcon, CheckIcon, RotateCcwIcon } from '../Icons';
import { useActionFeedback } from '../../hooks/useActionFeedback';

interface ErrorDisplayProps {
    error: string;
    title: string;
    onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, title, onRetry }) => {
    const { addToast } = useToast();
    const { isActionDone: isCopied, trigger: triggerCopied } = useActionFeedback();

    const handleCopyError = useCallback(() => {
        navigator.clipboard.writeText(error).then(() => {
            addToast('Error details copied');
            triggerCopied();
        });
    }, [error, addToast, triggerCopied]);

    return (
        <div className="p-4">
            <div className="text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                <div className="flex items-start">
                    <AlertTriangleIcon className="text-red-500 dark:text-red-400 mr-3 h-6 w-6 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold text-red-800 dark:text-red-300">{title}</p>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{error}</p>
                    </div>
                </div>
                <div className="flex justify-end items-center gap-2 mt-3">
                    <button
                        onClick={handleCopyError}
                        disabled={isCopied}
                        className="flex-shrink-0 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-400/20 disabled:text-green-600 dark:disabled:text-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-red-900/50"
                    >
                        {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        {isCopied ? 'Copied' : 'Copy'}
                    </button>
                    {onRetry && (
                         <button
                            onClick={onRetry}
                            className="flex-shrink-0 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-red-900/50"
                        >
                            <RotateCcwIcon className="w-4 h-4" />
                            Retry
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;