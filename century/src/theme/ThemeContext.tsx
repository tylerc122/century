import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Define themes
const themes = {
  // Warm, comfy color scheme (default)
  warm: {
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
  },
  // Dark theme
  dark: {
    background: '#1F1F1F', // Dark background
    foreground: '#E0E0E0', // Light text
    primary: '#D2691E', // Keep the cinnamon/terracotta as primary
    secondary: '#A0A0A0', // Medium gray
    success: '#66BB6A', // Green
    danger: '#E53935', // Red
    warning: '#FFA726', // Orange
    info: '#42A5F5', // Blue
    light: '#2D2D2D', // Lighter dark
    dark: '#121212', // Darker dark
    border: '#3D3D3D', // Dark gray
    cardBackground: '#2D2D2D', // Card background
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.3)', // Shadow
    headerBackground: '#252525', // Header background
    navBackground: '#252525', // Nav background
    accent1: '#EF5350', // Red accent
    accent2: '#66BB6A', // Green accent
  },
  // Light theme
  light: {
    background: '#FFFFFF', // White background
    foreground: '#333333', // Dark text
    primary: '#D2691E', // Keep the cinnamon/terracotta as primary
    secondary: '#757575', // Medium gray
    success: '#4CAF50', // Green
    danger: '#F44336', // Red
    warning: '#FF9800', // Orange
    info: '#2196F3', // Blue
    light: '#F5F5F5', // Light gray
    dark: '#212121', // Dark gray
    border: '#E0E0E0', // Light border
    cardBackground: '#F5F5F5', // Card background
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Shadow
    headerBackground: '#F5F5F5', // Header background
    navBackground: '#F5F5F5', // Nav background
    accent1: '#F44336', // Red accent
    accent2: '#4CAF50', // Green accent
  },
  // Sepia theme
  sepia: {
    background: '#F4ECD8', // Sepia background
    foreground: '#5B4636', // Brown text
    primary: '#A67C52', // Brown primary
    secondary: '#7D5A50', // Medium brown
    success: '#4B7F52', // Green
    danger: '#B54B3A', // Red
    warning: '#C7934B', // Orange
    info: '#4B6584', // Blue
    light: '#F8F3E6', // Light sepia
    dark: '#3A2E24', // Dark sepia
    border: '#E6DACB', // Sepia border
    cardBackground: '#F8F3E6', // Card background
    cardShadow: '0 2px 8px rgba(91, 70, 54, 0.15)', // Shadow
    headerBackground: '#EAE2D0', // Header background
    navBackground: '#EAE2D0', // Nav background
    accent1: '#B54B3A', // Red accent
    accent2: '#4B7F52', // Green accent
  },
  // Navy theme
  navy: {
    background: '#1A2A3A', // Navy background
    foreground: '#E0E9F4', // Light text
    primary: '#5B88A5', // Blue primary
    secondary: '#8CA3B8', // Medium blue
    success: '#5CAD85', // Green
    danger: '#D65353', // Red
    warning: '#E5A23D', // Orange
    info: '#5B88A5', // Blue
    light: '#253649', // Lighter navy
    dark: '#0F1721', // Darker navy
    border: '#2C3E50', // Navy border
    cardBackground: '#253649', // Card background
    cardShadow: '0 2px 8px rgba(15, 23, 33, 0.3)', // Shadow
    headerBackground: '#1F2F3F', // Header background
    navBackground: '#1F2F3F', // Nav background
    accent1: '#D65353', // Red accent
    accent2: '#5CAD85', // Green accent
  }
};

// Interface for the context
interface ThemeContextType {
  theme: typeof themes.warm;
  themeName: string;
  setTheme: (name: string) => void;
}

// Default theme is warm
const defaultTheme = themes.warm;

// Create context with default value
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  themeName: 'warm',
  setTheme: () => {},
});

// Create hook to use theme
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to track current theme
  const [currentTheme, setCurrentTheme] = useState<string>('warm');
  
  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('century_user_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.themeName && themes[parsedSettings.themeName as keyof typeof themes]) {
          setCurrentTheme(parsedSettings.themeName);
        }
      }
    } catch (error) {
      console.error('Error loading theme setting:', error);
    }
  }, []);
  
  // Function to change theme
  const setTheme = (name: string) => {
    if (themes[name as keyof typeof themes]) {
      setCurrentTheme(name);
    }
  };
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme: themes[currentTheme as keyof typeof themes] || themes.warm,
        themeName: currentTheme,
        setTheme 
      }}
    >
      <StyledThemeProvider theme={themes[currentTheme as keyof typeof themes] || themes.warm}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;


