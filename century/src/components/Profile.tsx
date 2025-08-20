import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import diaryService from '../services/diaryService';
import { DiaryEntry } from '../types';

// Styled components
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.background};
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
  background-color: ${({ theme }) => theme.light};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 2.5rem;
  color: ${({ theme }) => theme.secondary};
`;

const Username = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.foreground};
`;

const JoinedDate = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondary};
`;

const StatsContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  margin-bottom: 2rem;
`;

const StatsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.foreground};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  @media (min-width: 500px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.light};
  border-radius: 8px;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondary};
  margin-top: 0.5rem;
`;

const StreakContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  margin-bottom: 2rem;
`;

const WordStatsContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  margin-bottom: 2rem;
`;

const WordStatsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.foreground};
`;

const WordStatsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const WordStatsItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.light};
`;

const WordStatsLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondary};
`;

const WordStatsValue = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
`;

const FavoriteEntriesContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
`;

const FavoriteEntriesTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.foreground};
`;

const FavoriteEntriesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FavoriteEntryCard = styled.div`
  padding: 0.75rem;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.light};
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const FavoriteEntryTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.foreground};
  margin-bottom: 0.25rem;
`;

const FavoriteEntryDate = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondary};
`;

const EmptyFavorites = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${({ theme }) => theme.secondary};
  font-size: 0.9rem;
`;

const StreakTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.foreground};
`;

const StreakFlame = styled.span`
  margin-right: 0.5rem;
  color: #ff7b00;
`;

const StreakValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.foreground};
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
  background-color: ${props => props.active ? props.theme.primary : props.theme.light};
  border-radius: 2px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${({ theme }) => theme.secondary};
`;

// Mock data for initial state
const mockJoinedDate = new Date();
mockJoinedDate.setMonth(mockJoinedDate.getMonth() - 1); // Joined a month ago

const Profile: React.FC = () => {
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalWords: 0,
    currentStreak: 0,
    activityCalendar: Array(28).fill(false),
    mostFrequentWord: 'None',
    totalMediaUploaded: 0,
    favoriteEntries: [] as DiaryEntry[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [joinedDate] = useState(mockJoinedDate);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const userStats = await diaryService.getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return <LoadingMessage>Loading profile data...</LoadingMessage>;
  }

  return (
    <Container>
      <ProfileHeader>
        <Avatar>U</Avatar>
        <Username>User</Username>
        <JoinedDate>
          Joined {joinedDate.toLocaleDateString('en-US', { 
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
            <StatValue>{stats.totalEntries}</StatValue>
            <StatLabel>Total Entries</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.totalWords}</StatValue>
            <StatLabel>Total Words</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.totalMediaUploaded}</StatValue>
            <StatLabel>Media Uploaded</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>{stats.favoriteEntries.length}</StatValue>
            <StatLabel>Favorite Entries</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsContainer>

      <StreakContainer>
        <StreakTitle>
          <StreakFlame>🔥</StreakFlame> Current Streak
        </StreakTitle>
        <StreakValue>{stats.currentStreak} days</StreakValue>
        <CalendarGrid>
          {stats.activityCalendar.map((active, i) => (
            <CalendarDay key={i} active={active} />
          ))}
        </CalendarGrid>
      </StreakContainer>
      
      <WordStatsContainer>
        <WordStatsTitle>Word Statistics</WordStatsTitle>
        <WordStatsContent>
          <WordStatsItem>
            <WordStatsLabel>Most Frequent Word</WordStatsLabel>
            <WordStatsValue>{stats.mostFrequentWord}</WordStatsValue>
          </WordStatsItem>
          <WordStatsItem>
            <WordStatsLabel>Average Words Per Entry</WordStatsLabel>
            <WordStatsValue>
              {stats.totalEntries > 0 
                ? Math.round(stats.totalWords / stats.totalEntries) 
                : 0}
            </WordStatsValue>
          </WordStatsItem>
        </WordStatsContent>
      </WordStatsContainer>
      
      <FavoriteEntriesContainer>
        <FavoriteEntriesTitle>Favorite Entries</FavoriteEntriesTitle>
        {stats.favoriteEntries.length > 0 ? (
          <FavoriteEntriesList>
            {stats.favoriteEntries.map(entry => (
              <FavoriteEntryCard key={entry.id}>
                <FavoriteEntryTitle>{entry.title}</FavoriteEntryTitle>
                <FavoriteEntryDate>{entry.date.toLocaleDateString()}</FavoriteEntryDate>
              </FavoriteEntryCard>
            ))}
          </FavoriteEntriesList>
        ) : (
          <EmptyFavorites>
            You haven't marked any entries as favorites yet.
          </EmptyFavorites>
        )}
      </FavoriteEntriesContainer>
    </Container>
  );
};

export default Profile;


