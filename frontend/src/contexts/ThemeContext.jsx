import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Always use light theme

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Always remove dark class to ensure light theme
    root.classList.remove('dark');
    
    // Save to localStorage
    localStorage.setItem('theme', 'light');
  }, [theme]);

  const toggleTheme = () => {
    // Disabled - always light theme
    console.log('Theme toggle disabled - using light theme only');
  };

  const value = {
    theme: 'light',
    toggleTheme,
    isDark: false
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
