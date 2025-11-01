import React from 'react';
import { SendIcon } from '../Icons';

const ReadyState: React.FC = () => {
    return (
        <div className="text-slate-500 flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
            <SendIcon className="w-16 h-16 mb-6 text-slate-400 dark:text-slate-500" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Ready to Generate</h3>
            <p className="max-w-md text-slate-500 dark:text-slate-400">
                Press{' '}
                <kbd className="font-sans mx-0.5 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 rounded-md">Cmd</kbd>
                <span className="mx-0.5">+</span>
                <kbd className="font-sans mx-0.5 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 rounded-md">Enter</kbd>
                {' '}to bring your idea to life.
            </p>
        </div>
    );
};

export default ReadyState;
