import React from 'react';

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

interface HeaderProps {
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="relative py-6 px-4 sm:px-6 lg:px-8 text-center border-b border-slate-700">
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
        WesAI<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">.Dev</span>
      </h1>
      <p className="mt-2 text-md text-slate-400">
        Your AI-Powered Dev Scratchpad & Brainstorming Partner
      </p>
      <div className="absolute top-0 right-0 h-full flex items-center pr-4 sm:pr-6 lg:pr-8">
          <button onClick={onSettingsClick} className="text-slate-400 hover:text-white transition-colors" aria-label="Open settings">
              <SettingsIcon />
          </button>
      </div>
    </header>
  );
};

export default Header;
