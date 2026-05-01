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
  background:
    radial-gradient(circle at 12% 4%, ${({ theme }) => theme.accent1}22, transparent 24rem),
    radial-gradient(circle at 88% 12%, ${({ theme }) => theme.accent2}22, transparent 24rem),
    ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  font-family: var(--font-family);
  font-size: var(--font-size);
`;

const Header = styled.header`
  padding: 12px 24px;
  background-color: ${({ theme }) => theme.headerBackground || theme.background}ee;
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.border}cc;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.58) inset, 0 10px 24px rgba(86, 57, 43, 0.06);
  z-index: 20;
`;

const Title = styled.h1`
  font-size: 25px;
  font-weight: 700;
  color: ${({ theme }) => theme.foreground};
  letter-spacing: 0.03em;
  opacity: 0.92;
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
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.accent1});
  border: none;
  color: white;
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 9px 18px ${({ theme }) => theme.primary}33, inset 0 1px 0 rgba(255,255,255,0.28);
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
  
  &:hover {
    filter: saturate(1.08) brightness(1.02);
    box-shadow: 0 12px 24px ${({ theme }) => theme.primary}3d, inset 0 1px 0 rgba(255,255,255,0.35);
    transform: translateY(-1px);
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
  padding: 0.6rem 1rem 0.8rem;
  background-color: ${({ theme }) => theme.navBackground}e8;
  backdrop-filter: blur(18px);
  border-top: 1px solid ${({ theme }) => theme.border}cc;
  box-shadow: 0 -10px 22px rgba(86, 57, 43, 0.05);
`;

const NavButton = styled.button<{ active: boolean }>`
  min-width: 104px;
  padding: 0.62rem 1rem;
  border: 1px solid ${props => props.active ? props.theme.primary + '44' : 'transparent'};
  border-radius: 8px;
  background: ${props => props.active ? `linear-gradient(135deg, ${props.theme.primary}, ${props.theme.accent1})` : 'transparent'};
  color: ${props => props.active ? '#fff' : props.theme.secondary};
  font-weight: 650;
  cursor: pointer;
  box-shadow: ${props => props.active ? `0 8px 18px ${props.theme.primary}24` : 'none'};
  transition: transform 0.16s ease, background-color 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;

  &:hover {
    background-color: ${props => props.active ? 'transparent' : props.theme.light};
    color: ${props => props.active ? '#fff' : props.theme.foreground};
    transform: translateY(-1px);
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
