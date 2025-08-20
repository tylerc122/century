import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../theme/ThemeContext';

const ToggleContainer = styled.button`
  background: ${({ theme }) => theme.headerBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  font-size: 0.5rem;
  justify-content: space-between;
  margin: 0 auto;
  overflow: hidden;
  padding: 0.5rem;
  position: relative;
  width: 50px;
  height: 28px;
  transition: all 0.3s linear;

  &:focus {
    outline: none;
  }
`;

const ToggleIcon = styled.span`
  height: 18px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`;

const ToggleCircle = styled.span<{ isDark: boolean }>`
  position: absolute;
  top: 4px;
  left: 4px;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  transition: all 0.3s linear;
  transform: ${({ isDark }) =>
    isDark ? 'translateX(22px)' : 'translateX(0)'};
`;

const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <ToggleContainer onClick={toggleTheme}>
      <ToggleIcon>☀️</ToggleIcon>
      <ToggleIcon>🌙</ToggleIcon>
      <ToggleCircle isDark={isDark} />
    </ToggleContainer>
  );
};

export default ThemeToggle;

