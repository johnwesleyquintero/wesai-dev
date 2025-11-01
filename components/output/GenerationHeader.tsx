import React, { useCallback, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CodeOutput } from '../../copilot/agent';
import { CopyIcon, RotateCcwIcon, ShareIcon, CheckIcon, QrCodeIcon, CloseIcon } from '../Icons';
import { useActionFeedback } from '../../hooks/useActionFeedback';
import { TOOLTIP_CLASSES } from '../../constants';

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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
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
  
  const generateShareUrl = useCallback(() => {
    if (!prompt || !response) return null;
    const data = { prompt, react: response.react };
    const jsonString = JSON.stringify(data);
    const compressed = pako.deflate(jsonString, { to: 'string' });
    const encoded = btoa(compressed);
    const url = new URL(window.location.href);
    url.hash = encodeURIComponent(encoded);
    return url.toString();
  }, [prompt, response]);

  const handleShare = useCallback(async () => {
    const url = generateShareUrl();
    if (url) {
      try {
        const shareData = {
          title: 'WesAI.Dev Generation',
          text: `Check out this component I generated with WesAI: "${prompt}"`,
          url,
        };

        if (navigator.share) {
          await navigator.share(shareData);
          addToast('Shared successfully!');
          triggerShared();
        } else {
          await navigator.clipboard.writeText(url);
          addToast('Shareable link copied!');
          triggerShared();
        }
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          console.error("Failed to share:", e);
          addToast('Failed to create share link', 'error');
        }
      }
    }
  }, [prompt, generateShareUrl, addToast, triggerShared]);

  const handleQrCodeClick = useCallback(() => {
    const url = generateShareUrl();
    if (url) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}&qzone=1&bgcolor=f8fafc`;
        const qrUrlDark = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(url)}&qzone=1&bgcolor=0f172a&color=e2e8f0`;
        // Check current theme to show a pre-rendered QR code that matches
        const isDark = document.documentElement.classList.contains('dark');
        setQrCodeUrl(isDark ? qrUrlDark : qrUrl);
        setIsQrModalOpen(true);
    }
  }, [generateShareUrl]);


  return (
    <>
    <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-3 min-w-0">
      <div className="relative group bg-slate-200/70 dark:bg-slate-800/70 rounded-full px-2.5 py-1 min-w-0 fade-out-right">
        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap overflow-hidden">
            {prompt}
        </p>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs sm:max-w-sm md:max-w-md whitespace-normal break-words rounded-md bg-slate-800 dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none z-10 shadow-lg tooltip-with-arrow">
          {prompt}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleCopyPrompt}
          disabled={isPromptCopied}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-fast disabled:text-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Copy this prompt"
        >
          {isPromptCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
        </button>
        <div className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
          {isPromptCopied ? 'Copied!' : 'Copy Prompt'}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleReusePrompt}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Reuse this prompt"
        >
          <RotateCcwIcon className="w-4 h-4" />
        </button>
        <div className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
          Reuse Prompt
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleShare}
          disabled={isShared}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-fast disabled:text-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label={isShareApiAvailable ? "Share this generation" : "Copy shareable link"}
        >
          {isShared ? <CheckIcon className="w-4 h-4" /> : <ShareIcon className="w-4 h-4" />}
        </button>
        <div className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
          {isShared ? 'Link Copied!' : (isShareApiAvailable ? 'Share' : 'Copy Share Link')}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleQrCodeClick}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Show QR code for sharing"
        >
          <QrCodeIcon className="w-4 h-4" />
        </button>
        <div className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
          Show QR Code
        </div>
      </div>
    </div>
    {isQrModalOpen && (
        <div
            className="fixed inset-0 bg-slate-500/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in transition-opacity duration-normal"
            onClick={() => setIsQrModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
        >
            <div
                className="bg-slate-50 dark:bg-slate-900 rounded-lg shadow-xl p-6 w-full max-w-xs border border-slate-200 dark:border-slate-700 animate-scale-in text-center"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="qr-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">Scan to View</h2>
                    <button 
                        onClick={() => setIsQrModalOpen(false)} 
                        className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
                        aria-label="Close QR code modal"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="bg-white p-4 rounded-md">
                    <img src={qrCodeUrl} alt="QR Code for shareable link" width="256" height="256" className="mx-auto" />
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Open on your mobile device to test responsiveness.</p>
            </div>
        </div>
    )}
    </>
  );
};

export default GenerationHeader;