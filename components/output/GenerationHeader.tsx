import React, { useCallback } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CodeOutput } from '../../copilot/agent';
import { CopyIcon, RotateCcwIcon, ShareIcon, CheckIcon } from '../Icons';
import { useActionFeedback } from '../../hooks/useActionFeedback';

declare const pako: any;

interface GenerationHeaderProps {
  prompt: string;
  response: CodeOutput | null;
  onReusePrompt: (prompt: string) => void;
}

const GenerationHeader: React.FC<GenerationHeaderProps> = ({ prompt, response, onReusePrompt }) => {
  const { addToast } = useToast();
  const { isActionDone: isPromptCopied, trigger: triggerPromptCopied } = useActionFeedback();
  const { isActionDone: isShared, trigger: triggerShared } = useActionFeedback();
  const isShareApiAvailable = typeof navigator !== 'undefined' && !!navigator.share;

  const handleReusePrompt = useCallback(() => {
    if (prompt) {
      onReusePrompt(prompt);
      addToast('Prompt copied to input');
    }
  }, [prompt, onReusePrompt, addToast]);

  const handleCopyPrompt = useCallback(() => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      addToast('Prompt copied to clipboard');
      triggerPromptCopied();
    }
  }, [prompt, addToast, triggerPromptCopied]);

  const handleShare = useCallback(async () => {
    if (prompt && response) {
      try {
        const data = { prompt, react: response.react };
        const jsonString = JSON.stringify(data);
        const compressed = pako.deflate(jsonString, { to: 'string' });
        const encoded = btoa(compressed);
        const url = new URL(window.location.href);
        url.hash = encodeURIComponent(encoded);

        const shareData = {
          title: 'WesAI.Dev Generation',
          text: `Check out this component I generated with WesAI: "${prompt}"`,
          url: url.toString(),
        };

        // Use Web Share API if available (for mobile, etc.)
        if (navigator.share) {
          await navigator.share(shareData);
          addToast('Shared successfully!');
          triggerShared();
        } else {
          // Fallback to copying the link for desktop browsers
          await navigator.clipboard.writeText(url.toString());
          addToast('Shareable link copied!');
          triggerShared();
        }
      } catch (e) {
        // Don't show an error if the user cancels the share sheet
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error("Failed to share:", e);
          addToast('Failed to create share link', 'error');
        }
      }
    }
  }, [prompt, response, addToast, triggerShared]);

  return (
    <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-3 min-w-0">
      <div className="bg-slate-200/70 dark:bg-slate-800/70 rounded-full px-2.5 py-1 min-w-0">
        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis" title={prompt}>
            {prompt}
        </p>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleCopyPrompt}
          disabled={isPromptCopied}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-200 disabled:text-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Copy this prompt"
        >
          {isPromptCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
          {isPromptCopied ? 'Copied!' : 'Copy Prompt'}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleReusePrompt}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Reuse this prompt"
        >
          <RotateCcwIcon className="w-4 h-4" />
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
          Reuse Prompt
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleShare}
          disabled={isShared}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-200 disabled:text-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label={isShareApiAvailable ? "Share this generation" : "Copy shareable link"}
        >
          {isShared ? <CheckIcon className="w-4 h-4" /> : <ShareIcon className="w-4 h-4" />}
        </button>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
          {isShared ? 'Link Copied!' : (isShareApiAvailable ? 'Share' : 'Copy Share Link')}
        </div>
      </div>
    </div>
  );
};

export default GenerationHeader;