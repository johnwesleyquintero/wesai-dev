import React from 'react';
// FIX: SettingsIcon is no longer used as the settings UI is removed.
import { HelpIcon, SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    // FIX: onSettingsClick is removed as the settings UI is no longer needed.
    onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onHelpClick }) => {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="text-left">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500 tracking-tight">
                WesAI.Dev
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Build stunning apps & websites by chatting with AI.
            </p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={onToggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 transform hover:scale-110" aria-label="Toggle theme">
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            <button onClick={onHelpClick} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 transform hover:scale-110" aria-label="Open help and what's new">
                <HelpIcon className="w-6 h-6" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
