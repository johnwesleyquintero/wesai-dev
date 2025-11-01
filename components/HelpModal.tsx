

import React, { useRef } from 'react';
import { CloseIcon, CheckCircleIcon } from './Icons';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// FIX: Moved the `Key` component outside of `HelpModal`. Defining components inside other components is an anti-pattern that can cause performance issues and unexpected behavior, including type errors.
const Key = ({ children }: { children: React.ReactNode }) => (
    <kbd className="font-sans mx-0.5 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 rounded-md">
      {children}
    </kbd>
);

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  const { handleKeyDown } = useModalAccessibility(isOpen, onClose, modalRef, closeButtonRef);

  if (!isOpen) return null;

  const whatsNewItems = [
    { text: 'React-First Generation:', description: "WesAI now generates complete, self-contained React components (.tsx) instead of separate HTML/CSS/JS." },
    { text: 'Robust Sandbox Preview:', description: "Live previews are now rendered in a secure, isolated iframe for better performance and error handling." },
    { text: 'Resizable Panels:', description: "Drag the divider to resize the input and output panels to your liking. Your preference is saved automatically." },
    { text: 'UI/UX Overhaul:', description: "Refreshed the entire interface with a cleaner header, improved spacing, and more polished components for a professional feel." },
  ];
  
  const shortcuts = [
    { keys: ['Cmd', 'Ctrl'], plus: true, final: 'Enter', description: 'Generate Component' },
    { keys: ['←', '→'], description: 'Adjust Panel Size' },
    { keys: ['Shift'], description: 'Hold for large panel adjustments' },
    { keys: ['Esc'], description: 'Close this modal' },
  ];
  

  return (
    <div
      className="fixed inset-0 bg-slate-500/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in transition-opacity duration-normal"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto animate-scale-in custom-scrollbar focus:outline-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-slate-800 py-2 -mt-2">
          <h2 id="help-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">Help & What's New</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose} 
            className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
            aria-label="Close help"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8 text-slate-700 dark:text-slate-300">
            {/* What's New Section */}
            <div>
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">What's New</h3>
                <div className="space-y-3 text-sm">
                    {whatsNewItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <CheckCircleIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.text}</span> {item.description}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Keyboard Shortcuts Section */}
            <div>
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Keyboard Shortcuts</h3>
                <div className="space-y-3 text-sm">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex justify-between items-center gap-4">
                            <p className="text-slate-800 dark:text-slate-200">{shortcut.description}</p>
                            <div className="flex-shrink-0">
                                {shortcut.keys.map((key, i) => (
                                    <React.Fragment key={key}>
                                        {/* FIX: Explicitly pass children as a prop to resolve a potential tooling/compiler issue. */}
                                        <Key children={key} />
                                        {i < shortcut.keys.length - 1 && <span className="mx-0.5 text-slate-400 dark:text-slate-500">/</span>}
                                    </React.Fragment>
                                ))}
                                {shortcut.plus && <span className="mx-0.5 text-slate-400 dark:text-slate-500">+</span>}
                                {/* FIX: Explicitly pass children as a prop to resolve a potential tooling/compiler issue. */}
                                {shortcut.final && <Key children={shortcut.final} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Help Center Section */}
            <div>
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Help Center</h3>
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How do I use this app?</h4>
                        <p>Simply type a description of a web component you want to create in the text area. Be as descriptive as possible! Finally, click "Generate" or press <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">Cmd/Ctrl + Enter</code>. Your component will appear in the output panel.</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How does it work?</h4>
                        <p>This app uses the Google Gemini large language model to interpret your prompt and generate a self-contained React component. You can preview the result instantly and copy the code to use in your projects.</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
            <button
                onClick={onClose}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-normal transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 animate-gradient focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
            >
                Got it
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;