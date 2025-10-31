
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { HelpIcon, SunIcon, MoonIcon, WesAILogoIcon, RotateCcwIcon, CheckIcon } from './Icons';

interface HeaderProps {
    onHelpClick: () => void;
    onResetClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, onResetClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [isResetConfirming, setIsResetConfirming] = useState(false);

  // Automatically cancel the confirmation state after a timeout to prevent it from getting stuck.
  useEffect(() => {
    if (isResetConfirming) {
      const timer = setTimeout(() => setIsResetConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isResetConfirming]);

  const handleResetClick = () => {
    if (isResetConfirming) {
      onResetClick();
      setIsResetConfirming(false);
    } else {
      setIsResetConfirming(true);
    }
  };
  
  // Also cancel if the user moves their mouse away from the button.
  const handleResetMouseLeave = () => {
    if (isResetConfirming) {
      setIsResetConfirming(false);
    }
  };

  return (
    <header className="py-3 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 min-w-0">
            <WesAILogoIcon className="h-8 w-auto text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-3">
            <div className="relative group">
                <button 
                    onClick={handleResetClick} 
                    onMouseLeave={handleResetMouseLeave}
                    className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                        isResetConfirming 
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                    }`} 
                    aria-label={isResetConfirming ? "Confirm new session" : "Start new session"}
                >
                    {isResetConfirming ? <CheckIcon className="w-5 h-5" /> : <RotateCcwIcon className="w-5 h-5" />}
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none transform translate-y-0 group-hover:-translate-y-1 duration-200">
                    {isResetConfirming ? 'Are you sure?' : 'New Session'}
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

            <div className="relative group">
                <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-all duration-200 hover:scale-110" aria-label="Toggle theme">
                    {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                </button>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none transform translate-y-0 group-hover:-translate-y-1 duration-200">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </div>
            </div>
            <div className="relative group">
                <button onClick={onHelpClick} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-all duration-200 hover:scale-110" aria-label="Open help and what's new">
                    <HelpIcon className="w-6 h-6" />
                </button>
                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none transform translate-y-0 group-hover:-translate-y-1 duration-200">
                    Help & Info
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
