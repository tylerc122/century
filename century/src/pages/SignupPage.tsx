import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FONT_SIZES, FONT_FAMILIES, AVAILABLE_THEMES } from '../constants/theme';

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

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.light};
  color: ${({ theme }) => theme.foreground};
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}40;
  }
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Step 2 - Preferences
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('"Space Grotesk", sans-serif');
  const [themeName, setThemeName] = useState('warm');
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const handleNext = () => {
    // Validate fields
    if (!email.trim() || !username.trim() || !password.trim()) {
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
        username,
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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Choose a username"
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
                <Select
                  id="theme"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                >
                  {AVAILABLE_THEMES.map(theme => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="fontSize">Font Size</Label>
                <Select
                  id="fontSize"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                >
                  {FONT_SIZES.map(size => (
                    <option key={size.id} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select
                  id="fontFamily"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font.label} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </Select>
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
