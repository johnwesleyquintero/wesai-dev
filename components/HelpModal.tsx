import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-500/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-slate-800 py-2 -mt-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Help & What's New</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-3xl leading-none">&times;</button>
        </div>

        <div className="space-y-8 text-slate-700 dark:text-slate-300">
            {/* What's New Section */}
            <div>
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">What's New</h3>
                <ul className="space-y-2 list-disc list-inside text-sm">
                    <li><span className="font-semibold">UI/UX Overhaul:</span> Refreshed the entire interface with a cleaner header, improved spacing, and more polished components for a professional feel.</li>
                    <li><span className="font-semibold">Streamlined API:</span> Removed user-facing API key settings to simplify setup and improve security.</li>
                    <li><span className="font-semibold">Light/Dark Mode:</span> You can now toggle the UI theme using the sun/moon icon in the header.</li>
                    <li><span className="font-semibold">Help Center:</span> Added this helpful modal to answer common questions and announce updates.</li>
                </ul>
            </div>

            {/* Help Center Section */}
            <div>
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Help Center</h3>
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How do I use this app?</h4>
                        <p>Simply type a description of a web component you want to create in the text area. Be as descriptive as possible! Then, click "Generate" or press <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">Cmd/Ctrl + Enter</code>. Your component will appear in the output panel.</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How does it work?</h4>
                        <p>This app uses the Google Gemini large language model to interpret your prompt and generate HTML, CSS, and JavaScript code. You can preview the result instantly and copy the code to use in your projects.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
            <button
                onClick={onClose}
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
                Got it
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;