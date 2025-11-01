
import React, { useRef, useState, useEffect } from 'react';
import { CloseIcon, EyeIcon, InfoIcon } from './Icons';
import { useModalAccessibility } from '../hooks/useModalAccessibility';
import { useToast } from '../contexts/ToastContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string | null;
  onSaveKey: (key: string | null) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentKey, onSaveKey }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const [keyInput, setKeyInput] = useState(currentKey || '');
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const { addToast } = useToast();

  const { handleKeyDown } = useModalAccessibility(isOpen, onClose, modalRef, saveButtonRef);

  useEffect(() => {
    if (isOpen) {
        setKeyInput(currentKey || '');
    }
  }, [isOpen, currentKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput.trim() || null);
    addToast('API Key saved successfully!');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-500/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in transition-opacity duration-normal"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-700 max-h-[80vh] overflow-y-auto animate-scale-in custom-scrollbar focus:outline-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">API Key Settings</h2>
          <button
            onClick={onClose} 
            className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
            aria-label="Close settings"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
            <div>
                <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Google Gemini API Key
                </label>
                <div className="relative">
                    <input
                        id="api-key-input"
                        type={isKeyVisible ? 'text' : 'password'}
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="Enter your API key here"
                        className="font-mono w-full p-2 pr-10 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-fast"
                    />
                    <button
                        onClick={() => setIsKeyVisible(!isKeyVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        aria-label={isKeyVisible ? "Hide API key" : "Show API key"}
                    >
                        <EyeIcon className="w-5 h-5"/>
                    </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    You can get your API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Google AI Studio</a>.
                </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-500 p-3 text-yellow-800 dark:text-yellow-300 text-sm rounded-r-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <InfoIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" />
                    </div>
                    <div className="ml-3">
                        <p>
                            <span className="font-semibold">Security Note:</span> For your convenience during testing, this key will be stored in your browser's local storage. Do not use this feature in a shared or public environment.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
             <button
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
            >
                Cancel
            </button>
            <button
                ref={saveButtonRef}
                onClick={handleSave}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-all duration-normal transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 animate-gradient focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
            >
                Save Key
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
