
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 text-center border-b border-slate-700">
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
        WesAI<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">.Dev</span>
      </h1>
      <p className="mt-2 text-md text-slate-400">
        Your AI-Powered Dev Scratchpad & Brainstorming Partner
      </p>
    </header>
  );
};

export default Header;