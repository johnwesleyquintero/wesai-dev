

import React, { useState, useCallback } from 'react';
import { quickStartPrompts, PromptTemplate } from '../copilot/prompts';
import { getPromptIcon } from './promptUtils';
import { CheckIcon } from './Icons';

interface QuickStartPromptsProps {
  setPrompt: (prompt: string) => void;
  onPromptSelect?: () => void; // Optional callback, e.g., to focus an element
  layout: 'grid' | 'initial';
}

const QuickStartPrompts: React.FC<QuickStartPromptsProps> = ({ setPrompt, onPromptSelect, layout }) => {
  const [copiedPromptKey, setCopiedPromptKey] = useState<PromptTemplate['key'] | null>(null);

  const handlePromptClick = useCallback((prompt: PromptTemplate) => {
    setPrompt(prompt.prompt);
    onPromptSelect?.();
    setCopiedPromptKey(prompt.key);
    setTimeout(() => setCopiedPromptKey(null), 2000);
  }, [setPrompt, onPromptSelect]);
    
  if (layout === 'grid') {
    return (
        <>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Quick Start</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                {quickStartPrompts.map((p) => (
                    <button 
                        key={p.key} 
                        onClick={() => handlePromptClick(p)} 
                        className="relative text-left p-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg text-slate-600 dark:text-slate-300 transition-all duration-200 border border-slate-200 dark:border-slate-700/50 transform hover:scale-[1.03] hover:shadow-lg hover:border-indigo-400/50 dark:hover:border-indigo-500/50 flex items-start gap-3 overflow-hidden"
                    >
                        <div className={`transition-opacity duration-300 ${copiedPromptKey === p.key ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">{getPromptIcon(p.key, 'w-5 h-5')}</div>
                                <div>
                                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">{p.title}</span>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`absolute inset-0 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 transition-opacity duration-300 ${copiedPromptKey === p.key ? 'opacity-100' : 'opacity-0'}`}>
                            <CheckIcon className="w-4 h-4" />
                            <span className="text-xs font-semibold">Copied to input!</span>
                        </div>
                    </button>
                ))}
            </div>
        </>
    );
  }

  // layout === 'initial'
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStartPrompts.map((example) => (
            <button
                key={example.key}
                onClick={() => handlePromptClick(example)}
                className="relative text-center p-4 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200 transform hover:-translate-y-1 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-300/70 dark:hover:border-indigo-500/70 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/25 flex flex-col items-center justify-center gap-3 overflow-hidden h-28"
            >
                 <div className={`transition-opacity duration-300 flex flex-col items-center gap-3 ${copiedPromptKey === example.key ? 'opacity-0' : 'opacity-100'}`}>
                    {getPromptIcon(example.key, 'w-6 h-6')}
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{example.title}</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{example.description}</p>
                    </div>
                </div>

                <div className={`absolute inset-0 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 transition-opacity duration-300 ${copiedPromptKey === example.key ? 'opacity-100' : 'opacity-0'}`}>
                    <CheckIcon className="w-5 h-5" />
                    <span className="text-sm font-semibold">Copied!</span>
                </div>
            </button>
        ))}
    </div>
  );
};

export default QuickStartPrompts;