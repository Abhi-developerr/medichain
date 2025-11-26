import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    console.log('Theme changed to:', theme);
    console.log('HTML element:', root);
    console.log('Current classes:', root.className);
    
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('Added dark class');
    } else {
      root.classList.remove('dark');
      console.log('Removed dark class');
    }
    
    console.log('Classes after update:', root.className);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
