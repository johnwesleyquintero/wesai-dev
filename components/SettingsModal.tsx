import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    onClose();
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-300 mb-2">
                    Gemini API Key
                </label>
                <input
                    type="password"
                    id="api-key-input"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full p-2 bg-slate-900 text-slate-200 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <div className="text-xs text-slate-500 bg-slate-900/50 p-3 rounded-md">
                <p>Your API key is stored locally in your browser's localStorage and is never sent to our servers. Be cautious about pasting sensitive keys into web applications.</p>
            </div>
        </div>

        <div className="mt-6 flex justify-end">
            <button
                onClick={handleSave}
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
                Save and Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
