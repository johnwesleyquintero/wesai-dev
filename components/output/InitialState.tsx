
import React from 'react';
import { InitialStateLogoIcon } from '../Icons';
import { quickStartPrompts } from '../../copilot/prompts';
import { getPromptIcon } from '../promptUtils';

const InitialState: React.FC<{ setPrompt: (prompt: string) => void }> = ({ setPrompt }) => {
    return (
        <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
            <InitialStateLogoIcon className="w-24 h-24 mb-6" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Your AI Co-pilot for the Web</h3>
            <p className="max-w-md text-slate-500 dark:text-slate-400 mb-8">Describe a component, or get started with an example:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {quickStartPrompts.map((example) => (
                     <button
                        key={example.title}
                        onClick={() => setPrompt(example.prompt)}
                        className="text-center p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200 transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20 flex flex-col items-center gap-3"
                    >
                        {getPromptIcon(example.key, 'w-6 h-6')}
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{example.title}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{example.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default InitialState;
