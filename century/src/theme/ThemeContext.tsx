import React, { createContext, useContext } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Warm, comfy color scheme
const theme = {
  background: '#FAF3E0', // Warm cream background
  foreground: '#5D4037', // Rich brown for text
  primary: '#D2691E', // Cinnamon/terracotta as primary
  secondary: '#8D6E63', // Medium brown
  success: '#558B2F', // Forest green
  danger: '#C62828', // Deep red
  warning: '#EF6C00', // Amber orange
  info: '#0277BD', // Deep blue
  light: '#FFF8E1', // Lighter cream
  dark: '#3E2723', // Dark chocolate
  border: '#D7CCC8', // Light taupe
  cardBackground: '#FFF8E1', // Light cream for cards
  cardShadow: '0 2px 8px rgba(93, 64, 55, 0.15)', // Soft brown shadow
  headerBackground: '#F5E9D0', // Slightly darker cream for headers
  navBackground: '#F5E9D0', // Matching header
  accent1: '#E57373', // Soft coral accent
  accent2: '#81C784', // Soft sage accent 
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


