

import React from 'react';
import { InitialStateLogoIcon } from '../Icons';
import QuickStartPrompts from '../QuickStartPrompts';

const InitialState: React.FC<{ setPrompt: (prompt: string) => void }> = ({ setPrompt }) => {
    return (
        <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
            <InitialStateLogoIcon className="w-24 h-24 mb-6" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Your AI Co-pilot for the Web</h3>
            <p className="max-w-md text-slate-500 dark:text-slate-400 mb-8">Describe a component, or get started with an example:</p>
            <div className="w-full max-w-2xl">
                <QuickStartPrompts setPrompt={setPrompt} layout="initial" />
            </div>
        </div>
    );
};

export default InitialState;
