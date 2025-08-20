import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeMode } from '../types';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const themes = {
  light: {
    background: '#ffffff',
    foreground: '#333333',
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    border: '#e9ecef',
    cardBackground: '#ffffff',
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    headerBackground: '#f8f9fa',
    navBackground: '#f8f9fa'
  },
  dark: {
    background: '#121212',
    foreground: '#e0e0e0',
    primary: '#1e88e5',
    secondary: '#9e9e9e',
    success: '#43a047',
    danger: '#e53935',
    warning: '#ffb300',
    info: '#00acc1',
    light: '#212121',
    dark: '#e0e0e0',
    border: '#2d2d2d',
    cardBackground: '#1e1e1e',
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    headerBackground: '#1e1e1e',
    navBackground: '#1e1e1e'
  }
};

// Create context
const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  toggleTheme: () => {},
});

// Create hook to use theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const getSavedTheme = (): ThemeMode => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };

  const [themeMode, setThemeMode] = useState<ThemeMode>(getSavedTheme());
  
  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', themeMode);
    
    // Update document body class for global styles
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${themeMode}`);
  }, [themeMode]);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setThemeMode(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      <StyledThemeProvider theme={themes[themeMode]}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

