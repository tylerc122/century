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
  },
  // Forest theme
  forest: {
    background: '#1E2C1E', // Dark green background
    foreground: '#E8F0E8', // Light text
    primary: '#4B7A47', // Forest green primary
    secondary: '#85A483', // Medium green
    success: '#68BB59', // Bright green
    danger: '#D65353', // Red
    warning: '#E5C13D', // Yellow
    info: '#5B9CA5', // Teal blue
    light: '#2A3D2A', // Lighter forest green
    dark: '#0F1A0F', // Darker forest green
    border: '#345634', // Forest green border
    cardBackground: '#2A3D2A', // Card background
    cardShadow: '0 2px 8px rgba(15, 26, 15, 0.3)', // Shadow
    headerBackground: '#243324', // Header background
    navBackground: '#243324', // Nav background
    accent1: '#FF7043', // Orange accent
    accent2: '#81C784', // Light green accent
  },
  // Sunset theme
  sunset: {
    background: '#2C1E26', // Deep purple background
    foreground: '#F8E9E2', // Light text
    primary: '#FF7043', // Orange primary
    secondary: '#C17A6C', // Dusty rose
    success: '#5CAD85', // Green
    danger: '#D65353', // Red
    warning: '#FFAB40', // Amber
    info: '#7986CB', // Purple blue
    light: '#3A2732', // Lighter sunset
    dark: '#1E1419', // Darker sunset
    border: '#4A3540', // Purple border
    cardBackground: '#3A2732', // Card background
    cardShadow: '0 2px 8px rgba(30, 20, 25, 0.3)', // Shadow
    headerBackground: '#31222B', // Header background
    navBackground: '#31222B', // Nav background
    accent1: '#FF9E80', // Light orange accent
    accent2: '#B39DDB', // Light purple accent
  },
  // Ocean theme
  ocean: {
    background: '#1A2E3B', // Deep blue background
    foreground: '#E4EEF2', // Light text
    primary: '#4FC3F7', // Sky blue primary
    secondary: '#81ABBC', // Medium blue
    success: '#4DB6AC', // Teal
    danger: '#E57373', // Red
    warning: '#FFD54F', // Yellow
    info: '#64B5F6', // Blue
    light: '#263E4E', // Lighter ocean
    dark: '#0F1C25', // Darker ocean
    border: '#2C4A5E', // Ocean border
    cardBackground: '#263E4E', // Card background
    cardShadow: '0 2px 8px rgba(15, 28, 37, 0.3)', // Shadow
    headerBackground: '#1F3441', // Header background
    navBackground: '#1F3441', // Nav background
    accent1: '#FF8A65', // Coral accent
    accent2: '#80DEEA', // Light cyan accent
  },
  // Monochrome theme
  monochrome: {
    background: '#1A1A1A', // Dark gray background
    foreground: '#E6E6E6', // Light text
    primary: '#999999', // Medium gray primary
    secondary: '#777777', // Medium dark gray
    success: '#AAAAAA', // Light gray
    danger: '#666666', // Dark gray
    warning: '#888888', // Gray
    info: '#AAAAAA', // Light gray
    light: '#2A2A2A', // Lighter gray
    dark: '#0F0F0F', // Darker gray
    border: '#444444', // Gray border
    cardBackground: '#2A2A2A', // Card background
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.3)', // Shadow
    headerBackground: '#222222', // Header background
    navBackground: '#222222', // Nav background
    accent1: '#CCCCCC', // Light gray accent
    accent2: '#555555', // Dark gray accent
  },
  // High Contrast theme
  highcontrast: {
    background: '#000000', // Black background
    foreground: '#FFFFFF', // White text
    primary: '#FFCC00', // Bright yellow primary
    secondary: '#00CCFF', // Bright blue
    success: '#00FF00', // Bright green
    danger: '#FF0000', // Bright red
    warning: '#FF9900', // Orange
    info: '#00CCFF', // Bright blue
    light: '#333333', // Dark gray
    dark: '#000000', // Black
    border: '#FFFFFF', // White border
    cardBackground: '#1A1A1A', // Very dark gray
    cardShadow: '0 2px 8px rgba(255, 255, 255, 0.2)', // White shadow
    headerBackground: '#000000', // Black background
    navBackground: '#000000', // Black background
    accent1: '#FF00FF', // Magenta accent
    accent2: '#00FFFF', // Cyan accent
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


