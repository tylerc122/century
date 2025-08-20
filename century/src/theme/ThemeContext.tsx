import React, { createContext, useContext } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

const theme = {
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
};

// Create a simple theme context
const ThemeContext = createContext(theme);

// Create hook to use theme
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StyledThemeProvider theme={theme}>
      {children}
    </StyledThemeProvider>
  );
};

export default ThemeContext;


