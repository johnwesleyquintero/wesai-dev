import React, { memo } from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="flex-shrink-0 text-center py-3 px-4 sm:px-6 lg:px-8 text-slate-500 dark:text-slate-400 text-xs bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-lg z-10 flex flex-wrap justify-center items-center gap-x-2 border-t border-slate-200 dark:border-slate-800">
        <span>© 2024 WesAI.Dev</span>
        <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>
        <span>Powered by <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Google Gemini</a>.</span>
    </footer>
  );
};

export default memo(Footer);
