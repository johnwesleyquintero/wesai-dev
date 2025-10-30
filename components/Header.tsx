
import React from 'react';
import { HelpIcon, SunIcon, MoonIcon, SettingsIcon } from './Icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onHelpClick: () => void;
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onHelpClick, onSettingsClick }) => {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center">
        <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            WesAI<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-500">.Dev</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create stunning apps & websites by chatting with AI.
            </p>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={onToggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Toggle theme">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={onHelpClick} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Open help and what's new">
                <HelpIcon />
            </button>
            <button onClick={onSettingsClick} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Open settings">
                <SettingsIcon />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;