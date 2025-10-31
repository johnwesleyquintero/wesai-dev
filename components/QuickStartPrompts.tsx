
import React from 'react';
import { quickStartPrompts } from '../copilot/prompts';
import { getPromptIcon } from './promptUtils';

interface QuickStartPromptsProps {
  setPrompt: (prompt: string) => void;
  onPromptSelect?: () => void; // Optional callback, e.g., to focus an element
  layout: 'grid' | 'initial';
}

const QuickStartPrompts: React.FC<QuickStartPromptsProps> = ({ setPrompt, onPromptSelect, layout }) => {
    
  if (layout === 'grid') {
    return (
        <>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Quick Start</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                {quickStartPrompts.map((p) => (
                    <button 
                        key={p.title} 
                        onClick={() => {
                            setPrompt(p.prompt);
                            onPromptSelect?.();
                        }} 
                        className="text-left p-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg text-slate-600 dark:text-slate-300 transition-all duration-200 border border-slate-200 dark:border-slate-700/50 transform hover:scale-[1.03] hover:shadow-lg hover:border-indigo-400/50 dark:hover:border-indigo-500/50 flex items-start gap-3"
                    >
                        <div className="flex-shrink-0 mt-0.5">{getPromptIcon(p.key, 'w-5 h-5')}</div>
                        <div>
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">{p.title}</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.description}</p>
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
                key={example.title}
                onClick={() => {
                    setPrompt(example.prompt);
                    onPromptSelect?.();
                }}
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
  );
};

export default QuickStartPrompts;
