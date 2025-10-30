
import React from 'react';
import { ModernSpinnerIcon } from './Icons';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-full">
            <ModernSpinnerIcon className="w-16 h-16 text-indigo-500 animate-spin" />
        </div>
    );
};

export default LoadingSpinner;
