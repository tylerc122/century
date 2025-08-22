import React, { useState } from 'react';
import styled from 'styled-components';

interface PasswordModalProps {
  onUnlock?: () => void;
  onSubmit?: () => void;
  onCancel: () => void;
  isVisible?: boolean;
  title?: string;
  currentPassword?: string;
  setCurrentPassword?: React.Dispatch<React.SetStateAction<string>>;
  newPassword?: string;
  setNewPassword?: React.Dispatch<React.SetStateAction<string>>;
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

const PasswordModal: React.FC<PasswordModalProps> = ({ 
  onUnlock, 
  onSubmit, 
  onCancel, 
  isVisible = true,
  title = (
    <>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'middle'}}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      This entry is locked
    </>
  ),
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword
}) => {
  // For password unlock mode (original functionality)
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Determine if we're in password change mode
  const isChangeMode = setCurrentPassword !== undefined && setNewPassword !== undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isChangeMode) {
      // Password change mode
      if (!currentPassword || currentPassword.trim() === '') {
        setError('Please enter your current password');
      } else if (!newPassword || newPassword.trim() === '') {
        setError('Please enter a new password');
      } else if (onSubmit) {
        onSubmit();
        setError('');
      }
    } else {
      // Password unlock mode (original functionality)
      if (password.trim() === '') {
        setError('Please enter a password');
      } else if (onUnlock) {
        onUnlock();
        setPassword('');
        setError('');
      }
    }
  };

  return (
    <ModalOverlay isVisible={isVisible} onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <form onSubmit={handleSubmit}>
          {isChangeMode ? (
            // Password change mode UI
            <>
              <Input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword?.(e.target.value)}
                autoFocus
              />
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword?.(e.target.value)}
              />
            </>
          ) : (
            // Password unlock mode UI (original functionality)
            <Input
              type="password"
              placeholder="Enter password to unlock"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          )}
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <ButtonGroup>
            <CancelButton type="button" onClick={onCancel}>
              Cancel
            </CancelButton>
            <UnlockButton type="submit">
              {isChangeMode ? 'Change Password' : 'Unlock'}
            </UnlockButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PasswordModal;
