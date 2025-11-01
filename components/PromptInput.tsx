import React, { useRef, useEffect, useState } from 'react';
import { SparkleIcon, CloseIcon, CubeIcon } from './Icons';
import QuickStartPrompts from './QuickStartPrompts';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => void;
  isLoading: boolean;
  isHighlighting: boolean;
}

interface ProTipPart {
  type: 'text' | 'kbd';
  content: string;
}

interface ProTipData {
  parts: ProTipPart[];
}

const PRO_TIPS: ProTipData[] = [
  { parts: [{type: 'text', content: 'Press '}, {type: 'kbd', content: 'Cmd'}, {type: 'text', content: ' + '}, {type: 'kbd', content: 'Enter'}, {type: 'text', content: ' to generate.'}] },
  { parts: [{type: 'text', content: 'Be specific for better results. Try describing colors, layout, and state.'}] },
  { parts: [{type: 'text', content: "Need icons? Ask for 'inline SVGs' in your prompt for best results."}] },
  { parts: [{type: 'text', content: "WesAI is great for brainstorming variations. Try asking for 'another version'."}] },
  { parts: [{type: 'text', content: "Describe animations like 'a button that pulses on hover' for interactive results."}] },
];

const PROMPT_MAX_LENGTH = 4000;

const ProTip: React.FC<{ tip: ProTipData }> = ({ tip }) => {
  return (
    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
      Pro Tip: {tip.parts.map((part, index) => {
        if (part.type === 'kbd') {
          return (
            <kbd key={index} className="font-sans mx-0.5 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 rounded-md">
              {part.content}
            </kbd>
          );
        }
        return <React.Fragment key={index}>{part.content}</React.Fragment>;
      })}
    </p>
  );
};

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, handleGenerate, isLoading, isHighlighting }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [proTipIndex, setProTipIndex] = useState(0);
  const [isTipVisible, setIsTipVisible] = useState(true);
  
  useEffect(() => {
    // Select a random pro tip on component mount
    setProTipIndex(Math.floor(Math.random() * PRO_TIPS.length));

    // Cycle through pro tips
    const tipInterval = setInterval(() => {
        setIsTipVisible(false);
        setTimeout(() => {
            setProTipIndex(prevIndex => (prevIndex + 1) % PRO_TIPS.length);
            setIsTipVisible(true);
        }, 300); // Wait for fade-out to complete
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(tipInterval);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleGenerate();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to 'auto' to ensure the scrollHeight is calculated correctly
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      // Set the height to the new scrollHeight
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [prompt]);

  return (
    <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 ring-1 ring-black/5 dark:ring-white/10 rounded-lg flex flex-col h-full shadow-md transition-opacity duration-normal ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}>
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-2 pl-4">
             <div className="flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400"/>
                <h2 id="input-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-200">Input</h2>
             </div>
        </div>
        <div className="p-4 flex flex-col gap-4 flex-1 h-full min-h-0">
            <div className="relative w-full flex-grow flex flex-col">
                <textarea
                  ref={textareaRef}
                  id="prompt-input"
                  aria-labelledby="input-heading"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., A responsive login form with a 'remember me' checkbox and a pulsing gradient on the submit button..."
                  rows={3}
                  maxLength={PROMPT_MAX_LENGTH}
                  className={`font-mono w-full p-4 pr-10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-fast resize-none placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900/50 max-h-96 ${isHighlighting ? 'animate-pulse-indigo-glow' : ''}`}
                  disabled={isLoading}
                />
                {prompt && (
                <button
                    onClick={() => setPrompt('')}
                    className="absolute top-3 right-3 p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800"
                    aria-label="Clear input"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
                )}
            </div>
             <div className={`flex-shrink-0 overflow-hidden`}>
                <div className={`transition-[max-height,opacity,margin] duration-slow ease-in-out ${prompt ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100 mt-0'}`}>
                    <QuickStartPrompts setPrompt={setPrompt} onPromptSelect={() => textareaRef.current?.focus()} layout="grid" />
                </div>
            </div>
            <div className="mt-auto flex-shrink-0 space-y-3 pt-4">
                <div className="flex justify-between items-center">
                    <div className={`flex-1 transition-opacity duration-normal ${isTipVisible ? 'opacity-100' : 'opacity-0'}`}>
                      <ProTip tip={PRO_TIPS[proTipIndex]} />
                    </div>
                    <div className={`text-right text-xs font-mono pr-1 transition-colors ${prompt.length > PROMPT_MAX_LENGTH ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {prompt.length} / {PROMPT_MAX_LENGTH}
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-normal flex items-center justify-center gap-2 transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/50 animate-gradient ${!isLoading && prompt.trim() ? 'animate-pulse-glow' : ''} ${isLoading ? 'pointer-events-auto' : ''}`}
                >
                    {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
    </div>
  );
};

export default PromptInput;