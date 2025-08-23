import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FONT_SIZES, FONT_FAMILIES, AVAILABLE_THEMES } from '../constants/theme';
import ThemeContext from '../theme/ThemeContext';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.background};
  padding: 2rem;
`;

const SignupBox = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 10px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.foreground};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Subtitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.foreground};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Step = styled.div<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 0.5rem;
  background-color: ${({ active, theme }) => 
    active ? theme.primary : theme.border};
  transition: all 0.3s ease;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.foreground};
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.light};
  color: ${({ theme }) => theme.foreground};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}40;
  }
`;

// Styled Dropdown components based on existing patterns in the app
const StyledDropdownContainer = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 6px rgba(93, 64, 55, 0.08);
  width: 100%;
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
  max-height: 300px;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 4px 12px rgba(93, 64, 55, 0.15);
  z-index: 100;
  
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
`;

const MenuItem = styled.div<{ active: boolean }>`
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  background-color: ${({ active, theme }) => active ? `${theme.primary}20` : 'transparent'};
  font-weight: ${({ active }) => active ? 500 : 400};
  
  &:hover {
    background-color: ${({ theme }) => `${theme.primary}10`};
  }
  
  svg {
    margin-right: 8px;
    opacity: 0.8;
  }
`;

// Hidden select for accessibility
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  flex: 1;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.primary}ee;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.foreground};
  border: 1px solid ${({ theme }) => theme.border};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.light};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.danger};
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SkipText = styled.p`
  color: ${({ theme }) => theme.secondary};
  font-size: 0.85rem;
  text-align: center;
  margin-top: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.secondary};
  font-size: 0.9rem;
  margin-bottom: 1rem;
  text-align: center;
`;



const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 1 - Account details
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2 - Preferences
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('"Space Grotesk", sans-serif');
  const [themeName, setThemeName] = useState('warm');
  
  // Dropdown states
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [fontSizeDropdownOpen, setFontSizeDropdownOpen] = useState(false);
  const [fontFamilyDropdownOpen, setFontFamilyDropdownOpen] = useState(false);
  
  // Get theme context for real-time preview
  const themeContext = useContext(ThemeContext);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  // Apply theme and font changes in real-time
  useEffect(() => {
    // Apply font variables for preview
    const applyFontVariables = () => {
      // Remove existing font-variable style if it exists
      const existingStyle = document.getElementById('signup-preview-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // Create a new style element with a higher specificity approach
      const style = document.createElement('style');
      style.id = 'signup-preview-styles';
      style.textContent = `
        html, body {
          font-size: ${fontSize} !important;
        }
        
        html *, body * {
          font-size: inherit;
        }
        
        body, #root, .app, button, input, textarea, select, div, p, span, a, h1, h2, h3, h4, h5, h6 {
          font-family: ${fontFamily} !important;
        }
        
        /* Override any conflicting styles with high specificity */
        html body#root,
        html[data-theme] body,
        #root[class],
        body[class] {
          font-size: ${fontSize} !important;
        }
      `;
      
      // Add to document head
      document.head.appendChild(style);
    };
    
    applyFontVariables();
    
    // Clean up function to remove style when unmounting
    return () => {
      const existingStyle = document.getElementById('signup-preview-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [fontSize, fontFamily]);
  
  // Close dropdowns when clicking outside
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
  
  // Handle theme change with real-time preview
  useEffect(() => {
    if (themeContext && themeContext.setTheme) {
      themeContext.setTheme(themeName);
    }
  }, [themeName, themeContext]);
  
  // Handle dropdown toggles
  const toggleThemeDropdown = () => setThemeDropdownOpen(!themeDropdownOpen);
  const toggleFontSizeDropdown = () => setFontSizeDropdownOpen(!fontSizeDropdownOpen);
  const toggleFontFamilyDropdown = () => setFontFamilyDropdownOpen(!fontFamilyDropdownOpen);
  
  // Handle dropdown selection
  const handleThemeSelect = (theme: string) => {
    setThemeName(theme);
    setThemeDropdownOpen(false);
  };
  
  const handleFontSizeSelect = (size: string) => {
    setFontSize(size);
    setFontSizeDropdownOpen(false);
  };
  
  const handleFontFamilySelect = (family: string) => {
    setFontFamily(family);
    setFontFamilyDropdownOpen(false);
  };
  
  const handleNext = () => {
    // Validate fields
    if (!email.trim() || !firstName.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setError(null);
    setStep(2);
  };
  
  const handleBack = () => {
    setStep(1);
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setIsSubmitting(true);
      await signup({
        email,
        firstName,
        password,
        preferences: {
          fontSize,
          fontFamily,
          themeName
        }
      });
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container>
      <SignupBox>
        <Title>Sign Up</Title>
        
        <StepIndicator>
          <Step active={step === 1} />
          <Step active={step === 2} />
        </StepIndicator>
        
        {step === 1 ? (
          <>
            <Form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter your first name"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password"
                  minLength={6}
                />
              </FormGroup>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <ButtonContainer>
                <SecondaryButton type="button" onClick={() => navigate('/')}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Next
                </PrimaryButton>
              </ButtonContainer>
            </Form>
          </>
        ) : (
          <>
            <Subtitle>Customize Your Experience</Subtitle>
            <Description>Set your preferences or skip to use the default settings. You can always change these later.</Description>
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="theme">Theme</Label>
                <StyledDropdownContainer 
                  className="theme-dropdown" 
                  onClick={toggleThemeDropdown}
                >
                  <DropdownHeader className={themeDropdownOpen ? 'open' : ''}>
                    {AVAILABLE_THEMES.find(t => t.value === themeName)?.label || 'Select Theme'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </DropdownHeader>
                  
                  {/* Hidden accessible select for screen readers */}
                  <HiddenSelect 
                    id="theme"
                    value={themeName} 
                    onChange={(e) => setThemeName(e.target.value)}
                    aria-label="Select theme"
                  >
                    {AVAILABLE_THEMES.map(theme => (
                      <option key={theme.value} value={theme.value}>{theme.label}</option>
                    ))}
                  </HiddenSelect>
                  
                  {themeDropdownOpen && (
                    <DropdownMenu>
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
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="fontSize">Font Size</Label>
                <StyledDropdownContainer 
                  className="fontsize-dropdown" 
                  onClick={toggleFontSizeDropdown}
                >
                  <DropdownHeader className={fontSizeDropdownOpen ? 'open' : ''}>
                    {FONT_SIZES.find(f => f.value === fontSize)?.label || 'Select Size'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </DropdownHeader>
                  
                  {/* Hidden accessible select for screen readers */}
                  <HiddenSelect 
                    id="fontSize"
                    value={fontSize} 
                    onChange={(e) => setFontSize(e.target.value)}
                    aria-label="Select font size"
                  >
                    {FONT_SIZES.map(size => (
                      <option key={size.id} value={size.value}>{size.label}</option>
                    ))}
                  </HiddenSelect>
                  
                  {fontSizeDropdownOpen && (
                    <DropdownMenu>
                      {FONT_SIZES.map(size => (
                        <MenuItem 
                          key={size.id}
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
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="fontFamily">Font Family</Label>
                <StyledDropdownContainer 
                  className="fontfamily-dropdown" 
                  onClick={toggleFontFamilyDropdown}
                >
                  <DropdownHeader className={fontFamilyDropdownOpen ? 'open' : ''}>
                    {FONT_FAMILIES.find(f => f.value === fontFamily)?.label || 'Select Font'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </DropdownHeader>
                  
                  {/* Hidden accessible select for screen readers */}
                  <HiddenSelect 
                    id="fontFamily"
                    value={fontFamily} 
                    onChange={(e) => setFontFamily(e.target.value)}
                    aria-label="Select font family"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font.label} value={font.value}>{font.label}</option>
                    ))}
                  </HiddenSelect>
                  
                  {fontFamilyDropdownOpen && (
                    <DropdownMenu>
                      {FONT_FAMILIES.map(font => (
                        <MenuItem 
                          key={font.label}
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
              </FormGroup>
              
              {error && <ErrorMessage>{error}</ErrorMessage>}
              
              <ButtonContainer>
                <SecondaryButton type="button" onClick={handleBack}>
                  Back
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </PrimaryButton>
              </ButtonContainer>
              
              <SkipText>You can change these settings anytime in your profile</SkipText>
            </Form>
          </>
        )}
      </SignupBox>
    </Container>
  );
};

export default SignupPage;
