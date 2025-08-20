import { useState } from 'react';
import styled from 'styled-components';
import DiaryEntryList from '../components/DiaryEntryList';
import Profile from '../components/Profile';
import logo from '../assets/century.png';

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
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.headerBackground};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
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

  return (
    <AppContainer>
      <Header>
        <Logo src={logo} alt="century logo" />
        <Title>century</Title>
      </Header>

      <Content>
        {activeView === 'entries' && <DiaryEntryList />}
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