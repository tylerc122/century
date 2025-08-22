import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import ThemeContext from '../theme/ThemeContext';
import PasswordModal from './PasswordModal';

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

const SelectWrapper = styled.div`
  position: relative;
  min-width: 180px;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  appearance: none;
  background-color: ${({ theme }) => theme.light};
  color: ${({ theme }) => theme.foreground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary + '40'};
  }
`;

const SelectArrow = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: ${({ theme }) => theme.secondary};
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

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary + 'dd'};
  }
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

const FONT_SIZES = [
  { label: 'Small', value: '0.9rem' },
  { label: 'Medium', value: '1rem' },
  { label: 'Large', value: '1.1rem' },
  { label: 'Extra Large', value: '1.2rem' }
];

const FONT_FAMILIES = [
  { label: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", Times, serif' },
  { label: 'Sans Serif', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Monospace', value: '"Courier New", Courier, monospace' },
  { label: 'Space Grotesk', value: '"Space Grotesk", sans-serif' },
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
  const [fontSize, setFontSize] = useState('1rem');
  const [fontFamily, setFontFamily] = useState('-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
  const [themeName, setThemeName] = useState('warm');
  
  // State for modals/dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Load user settings from localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Check if there are settings saved
        const savedSettings = localStorage.getItem('century_user_settings');
        
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setFontSize(parsedSettings.fontSize || '1rem');
          setFontFamily(parsedSettings.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
          setThemeName(parsedSettings.themeName || 'warm');
          
          // Apply loaded settings
          document.documentElement.style.setProperty('--font-size', parsedSettings.fontSize || '1rem');
          document.documentElement.style.setProperty('--font-family', parsedSettings.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
        } else {
          // Set defaults if no settings found
          document.documentElement.style.setProperty('--font-size', '1rem');
          document.documentElement.style.setProperty('--font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    try {
      const settings = {
        fontSize,
        fontFamily,
        themeName
      };
      
      localStorage.setItem('century_user_settings', JSON.stringify(settings));
      
      // Apply settings
      document.documentElement.style.setProperty('--font-size', fontSize);
      document.documentElement.style.setProperty('--font-family', fontFamily);
      
        // Apply theme
  if (themeContext) {
    themeContext.setTheme(themeName);
  }
      
      // Show feedback
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  // Handle theme change
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setThemeName(newTheme);
    
    // If we have direct access to the theme context's setTheme function, use it
    if (themeContext && themeContext.setTheme) {
      themeContext.setTheme(newTheme);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFontSize(e.target.value);
  };

  // Handle font family change
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFontFamily(e.target.value);
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
            <SelectWrapper>
              <StyledSelect value={themeName} onChange={handleThemeChange}>
                {AVAILABLE_THEMES.map(theme => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </StyledSelect>
              <SelectArrow>▼</SelectArrow>
            </SelectWrapper>
          </SettingControl>
        </SettingRow>

        <SettingRow>
          <SettingLabel>
            Font Size
            <SettingDescription>Adjust the size of text throughout the app</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <SelectWrapper>
              <StyledSelect value={fontSize} onChange={handleFontSizeChange}>
                {FONT_SIZES.map(size => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </StyledSelect>
              <SelectArrow>▼</SelectArrow>
            </SelectWrapper>
          </SettingControl>
        </SettingRow>

        <SettingRow>
          <SettingLabel>
            Font Family
            <SettingDescription>Choose your preferred font style</SettingDescription>
          </SettingLabel>
          <SettingControl>
            <SelectWrapper>
              <StyledSelect value={fontFamily} onChange={handleFontFamilyChange}>
                {FONT_FAMILIES.map(font => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </StyledSelect>
              <SelectArrow>▼</SelectArrow>
            </SelectWrapper>
          </SettingControl>
        </SettingRow>
        
        <SettingRow>
          <SettingLabel>Apply Changes</SettingLabel>
          <PrimaryButton onClick={saveSettings}>Save Settings</PrimaryButton>
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
