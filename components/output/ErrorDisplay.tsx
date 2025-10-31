
import React, { useState, useCallback } from 'react';
import { AlertTriangleIcon, CopyIcon, CheckIcon } from '../Icons';

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

export default ErrorDisplay;
