import React from 'react';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  overflow-y: auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 2.5rem;
  color: #6c757d;
`;

const Username = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const JoinedDate = styled.p`
  font-size: 0.9rem;
  color: #6c757d;
`;

const StatsContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const StatsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #007bff;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 0.5rem;
`;

const StreakContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StreakTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
`;

const StreakFlame = styled.span`
  margin-right: 0.5rem;
  color: #ff7b00;
`;

const StreakValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #343a40;
  text-align: center;
  margin-bottom: 1rem;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
`;

const CalendarDay = styled.div<{ active: boolean }>`
  aspect-ratio: 1;
  background-color: ${props => props.active ? '#007bff' : '#e9ecef'};
  border-radius: 2px;
`;

// Mock data
const mockStreak = 7;
const mockTotalEntries = 42;
const mockTotalWords = 12568;
const mockJoinedDate = new Date('2024-08-01');

// Mock calendar data (last 28 days)
const mockCalendar = Array(28).fill(false)
  .map((_, i) => [0, 1, 2, 3, 4, 6, 7, 10, 13, 14, 15, 16, 17, 20, 21].includes(i));

const Profile: React.FC = () => {
  return (
    <Container>
      <ProfileHeader>
        <Avatar>U</Avatar>
        <Username>User</Username>
        <JoinedDate>
          Joined {mockJoinedDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long',
            day: 'numeric'
          })}
        </JoinedDate>
      </ProfileHeader>

      <StatsContainer>
        <StatsTitle>Your Stats</StatsTitle>
        <StatsGrid>
          <StatItem>
            <StatValue>{mockTotalEntries}</StatValue>
            <StatLabel>Total Entries</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{mockTotalWords}</StatValue>
            <StatLabel>Total Words</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsContainer>

      <StreakContainer>
        <StreakTitle>
          <StreakFlame>🔥</StreakFlame> Current Streak
        </StreakTitle>
        <StreakValue>{mockStreak} days</StreakValue>
        <CalendarGrid>
          {mockCalendar.map((active, i) => (
            <CalendarDay key={i} active={active} />
          ))}
        </CalendarGrid>
      </StreakContainer>
    </Container>
  );
};

export default Profile;