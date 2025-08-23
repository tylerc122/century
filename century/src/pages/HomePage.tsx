import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.background};
  padding: 2rem;
  text-align: center;
`;

const Logo = styled.h1`
  font-size: 3rem;
  font-weight: 500;
  color: ${({ theme }) => theme.foreground};
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
`;

const Tagline = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.secondary};
  max-width: 600px;
  margin-bottom: 3rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  border-radius: 6px;
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

const PrimaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary + 'ee'};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: transparent;
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
    </Container>
  );
};

export default HomePage;
