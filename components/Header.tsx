import React from 'react';
import { HelpIcon, SunIcon, MoonIcon, SettingsIcon, WesAILogoIcon } from './Icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    onSettingsClick: () => void;
    onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onSettingsClick, onHelpClick }) => {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-900/10 dark:border-white/10 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm shadow-slate-900/5 dark:shadow-black/50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <WesAILogoIcon className="h-8 w-auto text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-4">
            <button onClick={onToggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 transform hover:scale-110" aria-label="Toggle theme">
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
            <button onClick={onSettingsClick} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 transform hover:scale-110" aria-label="Open settings">
                <SettingsIcon className="w-6 h-6" />
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