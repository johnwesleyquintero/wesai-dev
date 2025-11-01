import React, { useState, useEffect } from 'react';
import { WesAILogoSpinnerIcon } from '../Icons';
import { LOADING_MESSAGES } from '../../constants';

const LoadingState: React.FC = () => {
    const [message, setMessage] = useState(LOADING_MESSAGES[0]);

    useEffect(() => {
        // Use a sequence of timeouts to create a staged loading experience
        const timeouts = [
            setTimeout(() => setMessage(LOADING_MESSAGES[1]), 1200),
            setTimeout(() => setMessage(LOADING_MESSAGES[2]), 2800),
            setTimeout(() => setMessage(LOADING_MESSAGES[3]), 4500)
        ];

        // Cleanup function to clear timeouts if the component unmounts
        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
            <WesAILogoSpinnerIcon className="w-24 h-24" />
            <p className="mt-6 text-lg font-medium text-slate-600 dark:text-slate-400 transition-all duration-500">{message}</p>
        </div>
    );
};

export default LoadingState;
