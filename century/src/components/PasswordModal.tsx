import React, { useState } from 'react';
import styled from 'styled-components';

interface PasswordModalProps {
  onUnlock: () => void;
  onCancel: () => void;
  isVisible: boolean;
}

const ModalOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid ${({ theme }) => theme.border};
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  font-size: 1rem;
  margin-bottom: 1.5rem;
  
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary + '20'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.light};
  color: ${({ theme }) => theme.foreground};
  
  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

const UnlockButton = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary + 'dd'};
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.danger || '#e53935'};
  font-size: 0.85rem;
  margin: -1rem 0 1rem;
`;

const PasswordModal: React.FC<PasswordModalProps> = ({ onUnlock, onCancel, isVisible }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, accept any input as valid (placeholder for real authentication)
    if (password.trim() === '') {
      setError('Please enter a password');
    } else {
      onUnlock();
      setPassword('');
      setError('');
    }
  };

  return (
    <ModalOverlay isVisible={isVisible} onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>🔒 This entry is locked</ModalTitle>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Enter password to unlock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <ButtonGroup>
            <CancelButton type="button" onClick={onCancel}>
              Cancel
            </CancelButton>
            <UnlockButton type="submit">
              Unlock
            </UnlockButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PasswordModal;
