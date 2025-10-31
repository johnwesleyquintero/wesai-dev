
import React, { useState, useCallback } from 'react';
import { CodeOutput } from '../../copilot/agent';
import { CopyIcon, CheckIcon, RotateCcwIcon, ShareIcon } from '../Icons';

interface GenerationHeaderProps {
  prompt: string;
  response: CodeOutput | null;
  onReusePrompt: (prompt: string) => void;
}

const GenerationHeader: React.FC<GenerationHeaderProps> = ({ prompt, response, onReusePrompt }) => {
  const [isReuseCopied, setIsReuseCopied] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);
  const [isShareLinkCopied, setIsShareLinkCopied] = useState(false);

  const handleReusePrompt = useCallback(() => {
    if (prompt) {
      onReusePrompt(prompt);
      setIsReuseCopied(true);
      setTimeout(() => setIsReuseCopied(false), 2000);
    }
  }, [prompt, onReusePrompt]);

  const handleCopyPrompt = useCallback(() => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setIsPromptCopied(true);
      setTimeout(() => setIsPromptCopied(false), 2000);
    }
  }, [prompt]);

  const handleShare = useCallback(() => {
    if (prompt && response) {
      try {
        const data = { prompt, react: response.react };
        const jsonString = JSON.stringify(data);
        const encoded = btoa(jsonString);

        const url = new URL(window.location.href);
        url.hash = encodeURIComponent(encoded);

        navigator.clipboard.writeText(url.toString()).then(() => {
          setIsShareLinkCopied(true);
          setTimeout(() => setIsShareLinkCopied(false), 2000);
        });
      } catch (e) {
        console.error("Failed to create share link:", e);
      }
    }
  }, [prompt, response]);

  return (
    <div className="flex items-center gap-1.5 border-l border-slate-300 dark:border-slate-700 pl-2 min-w-0">
      <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap fade-out-right" title={prompt}>
        {prompt}
      </p>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleCopyPrompt}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-200"
          aria-label="Copy this prompt"
        >
          {isPromptCopied ? <CheckIcon className="w-4 h-4 text-green-500 animate-scale-in" /> : <CopyIcon className="w-4 h-4" />}
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
          {isPromptCopied ? 'Copied!' : 'Copy Prompt'}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleReusePrompt}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-200"
          aria-label="Reuse this prompt"
        >
          {isReuseCopied ? <CheckIcon className="w-4 h-4 text-green-500 animate-scale-in" /> : <RotateCcwIcon className="w-4 h-4" />}
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
          {isReuseCopied ? 'Copied to Input!' : 'Reuse Prompt'}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleShare}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-200"
          aria-label="Share this generation"
        >
          {isShareLinkCopied ? <CheckIcon className="w-4 h-4 text-green-500 animate-scale-in" /> : <ShareIcon className="w-4 h-4" />}
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
          {isShareLinkCopied ? 'Link Copied!' : 'Share'}
        </div>
      </div>
    </div>
  );
};

export default GenerationHeader;