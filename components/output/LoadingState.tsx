import React, { useState, useEffect } from 'react';
import { WesAILogoSpinnerIcon } from '../Icons';

const LOADING_MESSAGES = [
    "WesAI is thinking...",
    "Architecting your component...",
    "Polishing the pixels...",
    "Generating brilliance..."
];

const LoadingState: React.FC = () => {
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
        <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
            <WesAILogoSpinnerIcon className="w-24 h-24" />
            <p className="mt-6 text-lg font-medium text-slate-600 dark:text-slate-400 transition-all duration-500">{message}</p>
        </div>
    );
};

export default LoadingState;