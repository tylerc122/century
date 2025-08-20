import { useState } from 'react';
import styled from 'styled-components';
import logo from './assets/century.png';
import DiaryEntryList from './components/DiaryEntryList';
import Profile from './components/Profile';

// Styled components
const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #343a40;
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
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
`;

const NavButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.active ? '#007bff' : '#e9ecef'};
  color: ${props => props.active ? '#fff' : '#343a40'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#0069d9' : '#dee2e6'};
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
