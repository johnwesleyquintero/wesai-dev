import React, { useId, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { HelpIcon, SunIcon, MoonIcon, WesAILogoIcon, RotateCcwIcon } from './Icons';
import { TOOLTIP_CLASSES } from '../constants';

interface HeaderProps {
    onHelpClick: () => void;
    onResetClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, onResetClick }) => {
  const { theme, toggleTheme } = useTheme();
  // Accessibility: Assign unique IDs for ARIA descriptions.
  const resetTooltipId = useId();
  const themeTooltipId = useId();
  const helpTooltipId = useId();

  return (
    <header className="flex-shrink-0 py-3 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg z-10 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 min-w-0">
            <WesAILogoIcon className="h-8 w-auto text-slate-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-3">
            <div className="relative group">
                <button 
                    onClick={onResetClick} 
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-all duration-fast hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950" 
                    aria-label="Start new session"
                    aria-describedby={resetTooltipId}
                >
                    <RotateCcwIcon className="w-5 h-5" />
                </button>
                <div id={resetTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
                    New Session
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

            <div className="relative group">
                <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-all duration-fast hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950" aria-label="Toggle theme" aria-describedby={themeTooltipId}>
                    {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                </button>
                <div id={themeTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </div>
            </div>
            <div className="relative group">
                <button onClick={onHelpClick} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-all duration-fast hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950" aria-label="Open help and what's new" aria-describedby={helpTooltipId}>
                    <HelpIcon className="w-6 h-6" />
                </button>
                 <div id={helpTooltipId} role="tooltip" className={`${TOOLTIP_CLASSES} left-1/2 -translate-x-1/2`}>
                    Help & Info
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);