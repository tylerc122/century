import { useState } from 'react';
import styled from 'styled-components';
import DiaryEntryList from '../components/DiaryEntryList';
import Profile from '../components/Profile';


// Styled components
const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  transition: all 0.3s ease;
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

function App() {
  const [activeView, setActiveView] = useState<'entries' | 'profile'>('entries');
  const [showEntryForm, setShowEntryForm] = useState<boolean>(false);

  return (
    <AppContainer>
      <Header>
        <Title>century</Title>
        <NewEntryButton onClick={() => setShowEntryForm(true)}>+</NewEntryButton>
      </Header>

      <Content>
        {activeView === 'entries' && <DiaryEntryList showEntryForm={showEntryForm} setShowEntryForm={setShowEntryForm} />}
        {activeView === 'profile' && <Profile />}
      </Content>

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
      </Navigation>
    </AppContainer>
  );
}

export default App;