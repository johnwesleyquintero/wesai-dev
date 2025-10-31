

import React, { useState, useEffect } from 'react';
import { WesAILogoSpinnerIcon } from '../Icons';

const LOADING_MESSAGES = [
    "WesAI is thinking...",
    "Architecting your component...",
    "Polishing the pixels...",
    "Generating brilliance..."
];

const LoadingState: React.FC<{ prompt: string }> = ({ prompt }) => {
    const [message, setMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % LOADING_MESSAGES.length;
            setMessage(LOADING_MESSAGES[index]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
             {prompt && (
                <div className="w-full max-w-xl mb-8 p-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 text-left" title={prompt}>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Generating:</span>
                        <span className="line-clamp-2 ml-1">{prompt}</span>
                    </p>
                    <div className="mt-3 w-full h-1 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-indeterminate-progress" style={{ backgroundSize: '200% 100%' }}></div>
                    </div>
                </div>
            )}
            <WesAILogoSpinnerIcon className="w-24 h-24" />
            <p className="mt-6 text-lg font-medium text-slate-600 dark:text-slate-400 transition-all duration-500 animate-fade-in">{message}</p>
        </div>
    );
};

export default LoadingState;