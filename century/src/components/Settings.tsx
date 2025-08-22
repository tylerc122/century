import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import ThemeContext from '../theme/ThemeContext';
import PasswordModal from './PasswordModal';

// Add fontSizeTimeout to window for state persistence
declare global {
  interface Window {
    fontSizeTimeout?: NodeJS.Timeout;
  }
}

// Styled components
const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background};
  overflow-y: auto;
`;

const SettingsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  margin-bottom: 1.5rem;
`;

const SettingsSection = styled.section`
  width: 100%;
  max-width: 800px;
  margin: 0 auto 2rem auto;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.foreground};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.primary};
  }
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.foreground};
  flex: 1;
`;

const SettingDescription = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondary};
  margin-top: 0.25rem;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StyledDropdownContainer = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 6px rgba(93, 64, 55, 0.08);
  min-width: 180px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  color: ${({ theme }) => theme.foreground};
  font-weight: 500;
  font-size: 0.95rem;
  line-height: normal;
  width: 100%;
  
  svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
    transition: transform 0.2s ease;
  }
  
  &.open svg {
    transform: rotate(180deg);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  overflow-y: auto;
  max-height: 300px; /* Limit height and make scrollable */
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 4px 12px rgba(93, 64, 55, 0.15);
  z-index: 100;
  
  /* Styled scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.cardBackground};
    border-radius: 0 8px 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.border};
    border-radius: 3px;
  }
  
  /* Make dropdown position smarter when near the bottom of the screen */
  &.position-top {
    bottom: calc(100% + 5px);
    top: auto;
  }
`;

const MenuItem = styled.div<{ active: boolean }>`
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  background-color: ${({ active }) => active ? `rgba(210, 105, 30, 0.15)` : 'transparent'};
  font-weight: ${({ active }) => active ? 500 : 400};
  
  &:hover {
    background-color: rgba(210, 105, 30, 0.08);
  }
  
  svg {
    margin-right: 8px;
    opacity: 0.8;
  }
`;

// Hidden actual select for accessibility
const HiddenSelect = styled.select`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
`;



const DangerButton = styled(Button)`
  background-color: ${({ theme }) => theme.danger || '#e53935'};
  color: white;
  
  &:hover {
    background-color: #c62828;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.light};
  color: ${({ theme }) => theme.foreground};
  
  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

const ConfirmationDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const DialogContent = styled.div`
  background-color: ${({ theme }) => theme.background};
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const DialogTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.foreground};
`;

const DialogText = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.foreground};
  margin-bottom: 1.5rem;
`;

const DialogButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

interface SettingsProps {
  // Add any props needed
}

// Define font sizes with explicit pixel values for consistency
const FONT_SIZES = [
  { label: 'Small', value: '14px', id: 'small' },
  { label: 'Medium', value: '16px', id: 'medium' },
  { label: 'Large', value: '18px', id: 'large' },
  { label: 'Extra Large', value: '20px', id: 'xlarge' }
];

const FONT_FAMILIES = [
  { label: 'Default (Social Haus)', value: '"Space Grotesk", sans-serif' },
  { label: 'Satoshi', value: "'Satoshi', sans-serif" },
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Geist Sans', value: "'Geist Sans', sans-serif" },
  { label: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" },
  { label: 'Manrope', value: "'Manrope', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Roboto Slab', value: "'Roboto Slab', serif" },
  { label: 'Lora', value: "'Lora', serif" },
  { label: 'Dancing Script', value: "'Dancing Script', cursive" },
  { label: 'Caveat', value: "'Caveat', cursive" },
  { label: 'System Sans-Serif', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", Times, serif' },
  { label: 'Sans Serif', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Monospace', value: '"Courier New", Courier, monospace' },
];

const AVAILABLE_THEMES = [
  { label: 'Warm (Default)', value: 'warm' },
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'Sepia', value: 'sepia' },
  { label: 'Navy', value: 'navy' }
];

const Settings: React.FC<SettingsProps> = () => {
  const themeContext = useContext(ThemeContext);
  
  // State for settings
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('"Space Grotesk", sans-serif');
  const [themeName, setThemeName] = useState('warm');
  
  // State for dropdowns
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [fontSizeDropdownOpen, setFontSizeDropdownOpen] = useState(false);
  const [fontFamilyDropdownOpen, setFontFamilyDropdownOpen] = useState(false);
  
  // References for dropdown position calculation
  const themeDropdownRef = React.useRef<HTMLDivElement>(null);
  const fontSizeDropdownRef = React.useRef<HTMLDivElement>(null);
  const fontFamilyDropdownRef = React.useRef<HTMLDivElement>(null);
  
  // State to track dropdown positioning
  const [positionDropdownsUp, setPositionDropdownsUp] = useState({
    theme: false,
    fontSize: false,
    fontFamily: false
  });
  
  // State for modals/dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Load user settings from localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Loading font settings...');
        
        // Check if there are settings saved
        const savedSettings = localStorage.getItem('century_user_settings');
        
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          console.log('Saved settings found:', parsedSettings);
          
          // Validate font size against available options
          let loadedFontSize = parsedSettings.fontSize || '16px'; // Default to Medium
          
          // Find the matching font size in our options
          const matchingFont = FONT_SIZES.find(fs => fs.value === loadedFontSize);
          if (!matchingFont) {
            // If not found or using old rem values, convert to our new system
            console.warn('Converting old font size to new system:', loadedFontSize);
            
            // Map old rem values to new pixel values
            if (loadedFontSize === '0.9rem') loadedFontSize = '14px';
            else if (loadedFontSize === '1rem') loadedFontSize = '16px';
            else if (loadedFontSize === '1.1rem') loadedFontSize = '18px';
            else if (loadedFontSize === '1.2rem') loadedFontSize = '20px';
            else loadedFontSize = '16px'; // Default to Medium
            
            console.log('Converted to:', loadedFontSize);
          }
          
          // Set state values
          console.log('Setting font size to:', loadedFontSize);
          setFontSize(loadedFontSize);
          setFontFamily(parsedSettings.fontFamily || '"Space Grotesk", sans-serif');
          
          // Apply the styles after state is set with a slightly longer timeout
          if (window.fontSizeTimeout) {
            clearTimeout(window.fontSizeTimeout);
          }
          window.fontSizeTimeout = setTimeout(() => {
            console.log('Applying loaded font settings...');
            if (parsedSettings) {
              applyFontVariables(loadedFontSize, parsedSettings.fontFamily || '"Space Grotesk", sans-serif');
            }
          }, 100);
        } else {
          // Set defaults if no settings found
          console.log('No saved settings, using defaults');
          setFontSize('16px'); // Medium
          setFontFamily('"Space Grotesk", sans-serif');
          
          // Apply default styles after state is set
          if (window.fontSizeTimeout) {
            clearTimeout(window.fontSizeTimeout);
          }
          window.fontSizeTimeout = setTimeout(() => {
            console.log('Applying default font settings...');
            applyFontVariables('16px', '"Space Grotesk", sans-serif');
          }, 100);
        }
        
        // Get the current theme from ThemeContext
        if (themeContext && themeContext.themeName) {
          setThemeName(themeContext.themeName);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
    
    // Clean up timeout on unmount
    return () => {
      if (window.fontSizeTimeout) {
        clearTimeout(window.fontSizeTimeout);
      }
    };
  }, [themeContext]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.theme-dropdown')) {
        setThemeDropdownOpen(false);
      }
      if (!target.closest('.fontsize-dropdown')) {
        setFontSizeDropdownOpen(false);
      }
      if (!target.closest('.fontfamily-dropdown')) {
        setFontFamilyDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Handle theme change - apply and save immediately
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    applyTheme(newTheme);
  };
  
  // Calculate dropdown position before opening
  const calculateDropdownPosition = (
    ref: React.RefObject<HTMLDivElement | null>, 
    dropdownType: 'theme' | 'fontSize' | 'fontFamily'
  ) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If space below is less than 300px (our max-height), position upward
      const shouldPositionUp = spaceBelow < 300;
      
      setPositionDropdownsUp(prev => ({
        ...prev,
        [dropdownType]: shouldPositionUp
      }));
      
      return shouldPositionUp;
    }
    return false;
  };

  // Toggle dropdown with position calculation
  const toggleDropdown = (
    dropdownType: 'theme' | 'fontSize' | 'fontFamily',
    ref: React.RefObject<HTMLDivElement | null>,
    currentState: boolean,
    setStateFn: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    // If opening the dropdown, calculate position
    if (!currentState) {
      calculateDropdownPosition(ref, dropdownType);
    }
    setStateFn(!currentState);
  };
  
  // Handle direct theme selection from dropdown
  const handleThemeSelect = (theme: string) => {
    applyTheme(theme);
    setThemeDropdownOpen(false);
  };
  
  // Apply theme function
  const applyTheme = (theme: string) => {
    setThemeName(theme);
    
    // Apply theme change immediately
    if (themeContext && themeContext.setTheme) {
      themeContext.setTheme(theme);
    }
    
    // Save to localStorage
    saveSettingToLocalStorage('themeName', theme);
  };

  // Handle font size change - apply and save immediately
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFontSize = e.target.value;
    applyFontSize(newFontSize);
  };
  
  // Handle direct font size selection from dropdown
  const handleFontSizeSelect = (size: string) => {
    applyFontSize(size);
    setFontSizeDropdownOpen(false);
  };
  
  // Apply font size function
  const applyFontSize = (newFontSize: string) => {
    // Clear any existing timeouts
    if (window.fontSizeTimeout) {
      clearTimeout(window.fontSizeTimeout);
    }
    
    console.log('Font size changing from', fontSize, 'to', newFontSize);
    
    // Ensure we're setting a valid font size
    const fontSizeOption = FONT_SIZES.find(fs => fs.value === newFontSize);
    if (fontSizeOption) {
      // Update state
      setFontSize(newFontSize);
      
      // Log the exact state changes for debugging
      console.log(`Font size selected: ${fontSizeOption.label} (${fontSizeOption.value}, ID: ${fontSizeOption.id})`);
      
      // Apply and save immediately
      applyFontVariables(newFontSize, fontFamily);
      saveSettingToLocalStorage('fontSize', newFontSize);
    } else {
      console.error('Invalid font size selected:', newFontSize);
    }
  };

  // Handle font family change - apply and save immediately
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFontFamily = e.target.value;
    applyFontFamily(newFontFamily);
  };
  
  // Handle direct font family selection from dropdown
  const handleFontFamilySelect = (family: string) => {
    applyFontFamily(family);
    setFontFamilyDropdownOpen(false);
  };
  
  // Apply font family function
  const applyFontFamily = (newFontFamily: string) => {
    setFontFamily(newFontFamily);
    
    // Apply immediately
    applyFontVariables(fontSize, newFontFamily);
    
    // Save to localStorage
    saveSettingToLocalStorage('fontFamily', newFontFamily);
  };
  
  // Helper function to save individual settings
  const saveSettingToLocalStorage = (settingName: string, value: string) => {
    try {
      // Get current settings or initialize empty object
      const savedSettings = localStorage.getItem('century_user_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      
      // Update the specific setting
      settings[settingName] = value;
      
      // Save back to localStorage
      localStorage.setItem('century_user_settings', JSON.stringify(settings));
    } catch (error) {
      console.error(`Error saving ${settingName} setting:`, error);
    }
  };
  
  // Apply font variables by directly setting styles for better consistency
  const applyFontVariables = (size: string, family: string) => {
    console.log(`Applying font size: ${size}, family: ${family}`);
    
    // Remove existing font-variable style if it exists
    const existingStyle = document.getElementById('century-font-variables');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create a new style element with a higher specificity approach
    const style = document.createElement('style');
    style.id = 'century-font-variables';
    style.textContent = `
      html, body {
        font-size: ${size} !important;
      }
      
      html *, body * {
        font-size: inherit;
      }
      
      body, #root, .app, button, input, textarea, select, div, p, span, a, h1, h2, h3, h4, h5, h6 {
        font-family: ${family} !important;
      }
      
      /* Override any conflicting styles with high specificity */
      html body#root,
      html[data-theme] body,
      #root[class],
      body[class] {
        font-size: ${size} !important;
      }
    `;
    
    // Add to document head
    document.head.appendChild(style);
    
    // Also update data attribute for debugging
    document.documentElement.setAttribute('data-font-size', size);
    
    // For debugging
    console.log(`Applied font size: ${size}`);
  };

  // Handle delete account confirmation
  const handleDeleteAccount = () => {
    try {
      // Clear all local storage data
      localStorage.removeItem('century_diary_entries');
      localStorage.removeItem('century_user_profile');
      localStorage.removeItem('century_user_settings');
      
      // Reset any app state or redirect to a sign-in page
      alert('Your account has been deleted successfully. The app will now reset.');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
    setShowDeleteConfirm(false);
  };

  // Handle password change
  const handlePasswordChange = () => {
    try {
      // In a real app, this would make an API call to change the password
      // For this local storage app, we'll just simulate success
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  return (
    <Container>
      <SettingsTitle>Settings</SettingsTitle>

      <SettingsSection>
        <SectionTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 18a6 6 0 100-12 6 6 0 000 12z"></path>
            <path d="M22 12h1M12 2V1M12 23v-1M4.22 19.78l-.7.7M18.78 19.78l.7.7M4.22 4.22l-.7-.7M18.78 4.22l.7-.7"></path>
          </svg>
          Appearance
        </SectionTitle>

        <SettingRow>
          <SettingLabel>
            Theme
            <SettingDescription>Change the color theme of the application</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <StyledDropdownContainer 
              className="theme-dropdown" 
              ref={themeDropdownRef}
              onClick={() => toggleDropdown('theme', themeDropdownRef, themeDropdownOpen, setThemeDropdownOpen)}
            >
              <DropdownHeader className={themeDropdownOpen ? 'open' : ''}>
                {AVAILABLE_THEMES.find(t => t.value === themeName)?.label || 'Select Theme'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </DropdownHeader>
              
              {/* Hidden accessible select for screen readers */}
              <HiddenSelect 
                value={themeName} 
                onChange={handleThemeChange}
                aria-label="Select theme"
              >
                {AVAILABLE_THEMES.map(theme => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
                ))}
              </HiddenSelect>
              
              {themeDropdownOpen && (
                <DropdownMenu className={positionDropdownsUp.theme ? 'position-top' : ''}>
                  {AVAILABLE_THEMES.map(theme => (
                    <MenuItem 
                      key={theme.value}
                      active={themeName === theme.value} 
                      onClick={() => handleThemeSelect(theme.value)}
                    >
                      {themeName === theme.value && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>} 
                      {theme.label}
                    </MenuItem>
                  ))}
                </DropdownMenu>
              )}
            </StyledDropdownContainer>
          </SettingControl>
        </SettingRow>

        <SettingRow>
          <SettingLabel>
            Font Size
            <SettingDescription>Adjust the size of text throughout the app</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <StyledDropdownContainer 
              className="fontsize-dropdown" 
              ref={fontSizeDropdownRef}
              onClick={() => toggleDropdown('fontSize', fontSizeDropdownRef, fontSizeDropdownOpen, setFontSizeDropdownOpen)}
            >
              <DropdownHeader className={fontSizeDropdownOpen ? 'open' : ''}>
                {FONT_SIZES.find(f => f.value === fontSize)?.label || 'Select Size'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </DropdownHeader>
              
              {/* Hidden accessible select for screen readers */}
              <HiddenSelect 
                value={fontSize} 
                onChange={handleFontSizeChange}
                aria-label="Select font size"
              >
                {FONT_SIZES.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </HiddenSelect>
              
              {fontSizeDropdownOpen && (
                <DropdownMenu className={positionDropdownsUp.fontSize ? 'position-top' : ''}>
                  {FONT_SIZES.map(size => (
                    <MenuItem 
                      key={size.value}
                      active={fontSize === size.value} 
                      onClick={() => handleFontSizeSelect(size.value)}
                    >
                      {fontSize === size.value && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>} 
                      {size.label}
                    </MenuItem>
                  ))}
                </DropdownMenu>
              )}
            </StyledDropdownContainer>
          </SettingControl>
        </SettingRow>

        <SettingRow>
          <SettingLabel>
            Font Family
            <SettingDescription>Choose your preferred font style</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <StyledDropdownContainer 
              className="fontfamily-dropdown" 
              ref={fontFamilyDropdownRef}
              onClick={() => toggleDropdown('fontFamily', fontFamilyDropdownRef, fontFamilyDropdownOpen, setFontFamilyDropdownOpen)}
            >
              <DropdownHeader className={fontFamilyDropdownOpen ? 'open' : ''}>
                {FONT_FAMILIES.find(f => f.value === fontFamily)?.label || 'Select Font'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </DropdownHeader>
              
              {/* Hidden accessible select for screen readers */}
              <HiddenSelect 
                value={fontFamily} 
                onChange={handleFontFamilyChange}
                aria-label="Select font family"
              >
                {FONT_FAMILIES.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </HiddenSelect>
              
              {fontFamilyDropdownOpen && (
                <DropdownMenu className={positionDropdownsUp.fontFamily ? 'position-top' : ''}>
                  {FONT_FAMILIES.map(font => (
                    <MenuItem 
                      key={font.value}
                      active={fontFamily === font.value} 
                      onClick={() => handleFontFamilySelect(font.value)}
                    >
                      {fontFamily === font.value && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>} 
                      {font.label}
                    </MenuItem>
                  ))}
                </DropdownMenu>
              )}
            </StyledDropdownContainer>
          </SettingControl>
        </SettingRow>
        

      </SettingsSection>

      <SettingsSection>
        <SectionTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0110 0v4"></path>
          </svg>
          Security
        </SectionTitle>

        <SettingRow>
          <SettingLabel>
            Password
            <SettingDescription>Change your account password</SettingDescription>
          </SettingLabel>
          <SecondaryButton onClick={() => setShowPasswordModal(true)}>Change Password</SecondaryButton>
        </SettingRow>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          </svg>
          Account
        </SectionTitle>

        <SettingRow>
          <SettingLabel>
            Delete Account
            <SettingDescription>Permanently delete your account and all data</SettingDescription>
          </SettingLabel>
          <DangerButton onClick={() => setShowDeleteConfirm(true)}>Delete Account</DangerButton>
        </SettingRow>
      </SettingsSection>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmationDialog>
          <DialogContent>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogText>
              Are you sure you want to delete your account? This will permanently remove all your entries and data. This action cannot be undone.
            </DialogText>
            <DialogButtons>
              <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>Cancel</SecondaryButton>
              <DangerButton onClick={handleDeleteAccount}>Yes, Delete Account</DangerButton>
            </DialogButtons>
          </DialogContent>
        </ConfirmationDialog>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <PasswordModal
          title="Change Password"
          onCancel={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
        />
      )}
    </Container>
  );
};

export default Settings;
