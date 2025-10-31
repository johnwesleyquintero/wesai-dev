import React, { createContext, useLayoutEffect, useContext, ReactNode } from 'react';
import usePersistentState from '../hooks/usePersistentState';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = usePersistentState<Theme>('theme', 
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useLayoutEffect(() => {
    const lightHljs = document.getElementById('hljs-light') as HTMLLinkElement | null;
    const darkHljs = document.getElementById('hljs-dark') as HTMLLinkElement | null;

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (lightHljs) lightHljs.disabled = true;
      if (darkHljs) darkHljs.disabled = false;
    } else {
      document.documentElement.classList.remove('dark');
      if (lightHljs) lightHljs.disabled = false;
      if (darkHljs) darkHljs.disabled = true;
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
