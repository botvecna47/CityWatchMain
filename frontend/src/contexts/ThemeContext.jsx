import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Force light theme for now
    setTheme('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  const toggleTheme = () => {
    // Keep light theme for consistency
    setTheme('light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: false
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
