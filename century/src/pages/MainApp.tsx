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
import diaryService from '../services/diaryService';

// Styled components
const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  font-family: var(--font-family);
  font-size: var(--font-size);
`;

const Header = styled.header`
  padding: 14px 24px;
  background-color: ${({ theme }) => theme.headerBackground || theme.background};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.28) inset;
  z-index: 20;
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
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.primary};
  border: none;
  color: white;
  font-size: 22px;
  line-height: 1;
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

const Content = styled.main`
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.75rem 1rem;
  background-color: ${({ theme }) => theme.navBackground};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const NavButton = styled.button<{ active: boolean }>`
  min-width: 104px;
  padding: 0.6rem 1rem;
  border: 1px solid ${props => props.active ? props.theme.primary : 'transparent'};
  border-radius: 8px;
  background-color: ${props => props.active ? props.theme.primary : 'transparent'};
  color: ${props => props.active ? '#fff' : props.theme.foreground};
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.active ? props.theme.primary + 'dd' : props.theme.light};
  }

  @media (max-width: 520px) {
    min-width: 0;
    flex: 1;
    padding-inline: 0.5rem;
  }
`;

function MainApp() {
  const [activeView, setActiveView] = useState<'entries' | 'profile' | 'entry' | 'viewEntry' | 'settings'>('entries');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
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

  const refreshEntries = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const hydrateEntry = async (entry: DiaryEntry) => {
    const fullEntry = await diaryService.getEntryById(entry.id);
    if (fullEntry) {
      setSelectedEntry(fullEntry);
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title onClick={() => setActiveView('entries')}>century</Title>
        <HeaderControls>
          <NewEntryButton onClick={() => {
            setSelectedEntry(undefined);
            setActiveView('entry');
          }} aria-label="Create a new entry">+</NewEntryButton>
        </HeaderControls>
      </Header>

      <Content>
        {activeView === 'entries' && (
          <DiaryEntryList 
            setSelectedEntry={setSelectedEntry}
            onEditEntry={(entry) => {
              setSelectedEntry(entry);
              setActiveView('entry');
              hydrateEntry(entry);
            }}
            onViewEntry={(entry) => {
              setSelectedEntry(entry);
              setActiveView('viewEntry');
              hydrateEntry(entry);
            }}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeView === 'profile' && <Profile onSelectEntry={handleSelectEntry} />}
        {activeView === 'settings' && <Settings onLogout={handleLogout} />}
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
            onDelete={refreshEntries}
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
            onRefresh={refreshEntries}
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
