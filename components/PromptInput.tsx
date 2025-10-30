import React from 'react';
import { SparkleIcon, CloseIcon, CubeIcon } from './Icons';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, handleGenerate, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleGenerate();
    }
  };
  
  const quickStartPrompts = [
    "A modern landing page for a SaaS product with a hero section, feature list, and a footer.",
    "A mini-app that generates creative writing prompts based on a selected genre.",
    "A simple to-do list app with the ability to add and complete tasks.",
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col h-full shadow-lg">
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-2 pl-4">
             <div className="flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                <h2 id="input-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-200">Input</h2>
             </div>
        </div>
        <div className="p-4 flex flex-col gap-4 flex-1 h-full">
            <div className="relative w-full flex-grow flex flex-col gap-4">
                <textarea
                  id="prompt-input"
                  aria-labelledby="input-heading"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., A responsive login form with a 'remember me' checkbox and a pulsing gradient on the submit button... (Cmd+Enter to generate)"
                  className="w-full h-full p-4 pr-10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none placeholder:text-slate-500 dark:placeholder:text-slate-500"
                  disabled={isLoading}
                />
                {prompt && (
                <button
                    onClick={() => setPrompt('')}
                    className="absolute top-3 right-3 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Clear input"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
                )}
                 <div className="flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Quick Start</p>
                    <div className="flex flex-col gap-2">
                        {quickStartPrompts.map((p, i) => (
                             <button key={i} onClick={() => setPrompt(p)} className="text-left text-xs p-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200 border border-slate-200 dark:border-slate-700/50">
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 animate-gradient"
            >
                {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                </>
                ) : (
                <>
                    <SparkleIcon className="w-5 h-5" />
                    Generate with WesAI
                </>
                )}
            </button>
        </div>
    </div>
  );
};

export default PromptInput;