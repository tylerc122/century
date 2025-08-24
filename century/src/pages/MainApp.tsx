import { useState } from 'react';
import styled from 'styled-components';
import DiaryEntryList from '../components/DiaryEntryList';
import Profile from '../components/Profile';
import EntryPage from '../components/EntryPage';
import ViewEntryPage from '../components/ViewEntryPage';
import Settings from '../components/Settings';
import { DiaryEntry } from '../types';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// Styled components
const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  transition: all 0.3s ease;
  font-family: var(--font-family);
  font-size: var(--font-size);
`;

const Header = styled.header`
  padding: 16px 20px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(215, 204, 200, 0.5);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 500;
  color: ${({ theme }) => theme.foreground};
  letter-spacing: 0.03em;
  opacity: 0.85;
  font-family: 'Space Grotesk', sans-serif;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NewEntryButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.primary};
  border: none;
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary + 'DD'};
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary + '40'};
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.secondary};
  font-size: 0.8rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.foreground};
  }
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.navBackground};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const NavButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.active ? props.theme.primary : props.theme.light};
  color: ${props => props.active ? '#fff' : props.theme.foreground};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? props.theme.primary + 'dd' : props.theme.light + 'dd'};
  }
`;

function MainApp() {
  const [activeView, setActiveView] = useState<'entries' | 'profile' | 'entry' | 'viewEntry' | 'settings'>('entries');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | undefined>(undefined);
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleSelectEntry = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setActiveView('entries');
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title onClick={() => setActiveView('entries')}>century</Title>
        <HeaderControls>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          <NewEntryButton onClick={() => {
            setSelectedEntry(undefined);
            setActiveView('entry');
          }}>+</NewEntryButton>
        </HeaderControls>
      </Header>

      <Content>
        {activeView === 'entries' && (
          <DiaryEntryList 
            setSelectedEntry={setSelectedEntry}
            onEditEntry={(entry) => {
              setSelectedEntry(entry);
              setActiveView('entry');
            }}
            onViewEntry={(entry) => {
              setSelectedEntry(entry);
              setActiveView('viewEntry');
            }}
          />
        )}
        {activeView === 'profile' && <Profile onSelectEntry={handleSelectEntry} />}
        {activeView === 'settings' && <Settings />}
        {activeView === 'viewEntry' && selectedEntry && (
          <ViewEntryPage
            entry={selectedEntry}
            onClose={() => {
              setActiveView('entries');
              setSelectedEntry(undefined);
            }}
            onEdit={(entry) => {
              setSelectedEntry(entry);
              setActiveView('entry');
            }}
          />
        )}
        {activeView === 'entry' && (
          <EntryPage 
            entry={selectedEntry}
            onSave={() => {
              setActiveView('entries');
              setSelectedEntry(undefined);
            }}
            onCancel={() => {
              setActiveView('entries');
              setSelectedEntry(undefined);
            }}
          />
        )}
      </Content>

      {activeView !== 'entry' && (
        <Navigation>
          <NavButton 
            active={activeView === 'entries'} 
            onClick={() => setActiveView('entries')}
          >
            Entries
          </NavButton>
          <NavButton 
            active={activeView === 'profile'} 
            onClick={() => setActiveView('profile')}
          >
            Profile
          </NavButton>
          <NavButton 
            active={activeView === 'settings'} 
            onClick={() => setActiveView('settings')}
          >
            Settings
          </NavButton>
        </Navigation>
      )}
    </AppContainer>
  );
}

export default MainApp;
