
import React, { useCallback, useState, useId, useMemo, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { CodeOutput } from '../../copilot/agent';
import { ShareIcon, CheckIcon, QrCodeIcon, CloseIcon } from '../Icons';
import { useActionFeedback } from '../../hooks/useActionFeedback';
import { TOOLTIP_CLASSES } from '../../constants';
import { useTheme } from '../../contexts/ThemeContext';

declare const pako: any;

interface ShareControlsProps {
  prompt: string;
  response: CodeOutput | null;
}

const ShareControls: React.FC<ShareControlsProps> = ({ prompt, response }) => {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const { isActionDone: isShared, trigger: triggerShared } = useActionFeedback();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const shareTooltipId = useId();
  const qrTooltipId = useId();

  const isShareApiAvailable = typeof navigator !== 'undefined' && !!navigator.share;

  const shareUrl = useMemo(() => {
    if (!prompt || !response) return null;
    try {
        const data = { prompt, react: response.react };
        const jsonString = JSON.stringify(data);
        
        const compressedString = pako.deflate(jsonString, { to: 'string' });
        
        const encoded = btoa(compressedString);
        const url = new URL(window.location.href);
        url.hash = encodeURIComponent(encoded);
        return url.toString();
    } catch (e) {
        console.error("Failed to generate share URL:", e);
        addToast('Could not create shareable link.', 'error');
        return null;
    }
  }, [prompt, response, addToast]);

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;

    try {
        const shareData = {
            title: 'WesAI.Dev Generation',
            text: `Check out this component I generated with WesAI: "${prompt}"`,
            url: shareUrl,
        };

        if (isShareApiAvailable) {
            await navigator.share(shareData);
            addToast('Shared successfully!');
        } else {
            await navigator.clipboard.writeText(shareUrl);
            addToast('Shareable link copied!');
        }
        triggerShared();
    } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
            console.error("Failed to share:", e);
            addToast('Could not create or share link.', 'error');
        }
    }
  }, [prompt, shareUrl, addToast, triggerShared, isShareApiAvailable]);

  // Effect to regenerate QR code URL if theme changes while modal is open
  useEffect(() => {
    if (isQrModalOpen && shareUrl) {
        const qrApiBase = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shareUrl)}&qzone=1`;
        const qrUrlWithTheme = theme === 'dark' 
            ? `${qrApiBase}&bgcolor=0f172a&color=e2e8f0` // dark slate-900 bg, slate-200 fg
            : `${qrApiBase}&bgcolor=f8fafc`; // light slate-50 bg
        setQrCodeUrl(qrUrlWithTheme);
    }
  }, [isQrModalOpen, shareUrl, theme]);


  const handleQrCodeClick = useCallback(() => {
    if (shareUrl) {
      setIsQrModalOpen(true);
    }
  }, [shareUrl]);

  return (
    <>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleShare}
          disabled={isShared}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-fast disabled:text-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label={isShareApiAvailable ? "Share this generation" : "Copy shareable link"}
          aria-describedby={shareTooltipId}
        >
          {isShared ? <CheckIcon className="w-4 h-4" /> : <ShareIcon className="w-4 h-4" />}
        </button>
        <div id={shareTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
          {isShared ? 'Link Copied!' : (isShareApiAvailable ? 'Share' : 'Copy Share Link')}
        </div>
      </div>
      <div className="relative group flex-shrink-0">
        <button
          onClick={handleQrCodeClick}
          className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          aria-label="Show QR code for sharing"
          aria-describedby={qrTooltipId}
        >
          <QrCodeIcon className="w-4 h-4" />
        </button>
        <div id={qrTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
          Show QR Code
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
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Code for shareable link" width="256" height="256" className="mx-auto" />
                    ) : (
                      <div className="w-64 h-64 bg-slate-200 animate-pulse rounded-md mx-auto"></div>
                    )}
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Open on your mobile device to test responsiveness.</p>
            </div>
        </div>
      )}
    </>
  );
};

export default ShareControls;
