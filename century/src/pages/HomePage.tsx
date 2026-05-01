import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 16% 18%, ${({ theme }) => theme.accent1}2b, transparent 25rem),
    radial-gradient(circle at 84% 20%, ${({ theme }) => theme.accent2}2b, transparent 25rem),
    linear-gradient(135deg, ${({ theme }) => theme.background}, ${({ theme }) => theme.light});
  padding: 2rem;
  text-align: center;
  position: relative;
`;

const Logo = styled.h1`
  font-size: clamp(2.6rem, 8vw, 4.8rem);
  font-weight: 800;
  color: ${({ theme }) => theme.foreground};
  margin-bottom: 0.75rem;
  letter-spacing: 0;
  font-family: 'Space Grotesk', sans-serif;
`;

const Tagline = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.secondary};
  max-width: 600px;
  margin-bottom: 2.5rem;
  line-height: 1.7;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DownloadPanel = styled.div`
  position: absolute;
  bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  color: ${({ theme }) => theme.secondary};
  font-size: 0.9rem;

  @media (max-height: 680px) {
    position: static;
    margin-top: 3rem;
  }
`;

const DownloadLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const DownloadLink = styled.a`
  color: ${({ theme }) => theme.foreground};
  text-decoration: none;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding-bottom: 2px;

  &:hover {
    color: ${({ theme }) => theme.primary};
    border-color: ${({ theme }) => theme.primary};
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.accent1});
  color: white;
  border: none;
  box-shadow: 0 12px 24px ${({ theme }) => theme.primary}30, inset 0 1px 0 rgba(255,255,255,0.28);
  
  &:hover {
    background-color: ${({ theme }) => theme.primary + 'ee'};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.cardBackground}b8;
  color: ${({ theme }) => theme.primary};
  border: 1px solid ${({ theme }) => theme.primary};
  
  &:hover {
    background-color: ${({ theme }) => theme.light};
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Container>
      <Logo>century</Logo>
      <Tagline>
        Record your life, one moment at a time. A minimalist journaling app designed to help you reflect and remember.
      </Tagline>
      
      <ButtonContainer>
        <PrimaryButton onClick={() => navigate('/signup')}>
          Sign Up
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate('/login')}>
          Login
        </SecondaryButton>
      </ButtonContainer>
      
      <DownloadPanel>
        <p>Desktop builds</p>
        <DownloadLinks>
          <DownloadLink href="/century-installer.dmg" download>
            Download for Mac
          </DownloadLink>
        </DownloadLinks>
      </DownloadPanel>
    </Container>
  );
};

export default HomePage;
