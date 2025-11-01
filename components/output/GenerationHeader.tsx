import React, { useCallback, useId } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CodeOutput } from '../../copilot/agent';
import { CopyIcon, RotateCcwIcon, CheckIcon } from '../Icons';
import { useActionFeedback } from '../../hooks/useActionFeedback';
import ShareControls from './ShareControls';
import { TOOLTIP_CLASSES } from '../../constants';

interface GenerationHeaderProps {
  prompt: string;
  response: CodeOutput | null;
  onReusePrompt: (prompt: string) => void;
}

const GenerationHeader: React.FC<GenerationHeaderProps> = ({ prompt, response, onReusePrompt }) => {
  const { addToast } = useToast();
  const { isActionDone: isPromptCopied, trigger: triggerPromptCopied } = useActionFeedback();

  const promptTooltipId = useId();
  const copyTooltipId = useId();
  const reuseTooltipId = useId();

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


  return (
    <>
    <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-3 min-w-0">
      <div className="relative group bg-slate-200/70 dark:bg-slate-800/70 rounded-full px-2.5 py-1 min-w-0 fade-out-right">
        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap overflow-hidden">
            {prompt}
        </p>
        <div id={promptTooltipId} role="tooltip" className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs sm:max-w-sm md:max-w-md whitespace-normal break-words rounded-md bg-slate-800 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-10 shadow-lg tooltip-with-arrow">
          {prompt}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleCopyPrompt}
          disabled={isPromptCopied}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-fast disabled:text-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Copy this prompt"
          aria-describedby={copyTooltipId}
        >
          {isPromptCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
        </button>
        <div id={copyTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
          {isPromptCopied ? 'Copied!' : 'Copy Prompt'}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleReusePrompt}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Reuse this prompt"
          aria-describedby={reuseTooltipId}
        >
          <RotateCcwIcon className="w-4 h-4" />
        </button>
        <div id={reuseTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
          Reuse Prompt
        </div>
      </div>
      <ShareControls prompt={prompt} response={response} />
    </div>
    </>
  );
};

export default GenerationHeader;