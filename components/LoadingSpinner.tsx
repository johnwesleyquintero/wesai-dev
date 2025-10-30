
import React from 'react';
import { WesAILogoSpinnerIcon } from './Icons';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center h-full">
            <WesAILogoSpinnerIcon className="w-16 h-16" />
        </div>
    );
};

export default LoadingSpinner;