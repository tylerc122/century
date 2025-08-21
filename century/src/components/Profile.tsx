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
  justify-content: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.light};
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  display: block;
  width: 100%;
  text-align: center;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondary};
  margin-top: 0.5rem;
  display: block;
  width: 100%;
  text-align: center;
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

const CalendarContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CalendarControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CalendarMonthYear = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  font-size: 0.95rem;
`;

const CalendarNavButton = styled.button`
  background-color: ${({ theme }) => theme.light};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
  color: ${({ theme }) => theme.foreground};
  font-weight: 600;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

const WeekdayLabels = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.35rem;
  margin-bottom: 0.5rem;
  width: 100%;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondary};
  font-weight: 600;
  padding: 0.25rem 0;
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
  grid-template-rows: auto;
  gap: 0.35rem;
  width: 100%;
  margin: 0 auto;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.light};
  border-radius: 8px;
`;

const CalendarDay = styled.div<{ active: boolean; isEmpty?: boolean; isToday?: boolean }>`
  aspect-ratio: 1;
  background-color: ${props => {
    if (props.isEmpty) return 'transparent';
    if (props.active) return props.theme.primary;
    return props.theme.border;
  }};
  border-radius: 4px;
  min-height: 30px;
  min-width: 30px;
  border: ${props => props.isEmpty ? 'none' : props.isToday ? `2px solid ${props.theme.dark}` : `1px solid ${props.theme.border}`};
  cursor: ${props => props.isEmpty ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: ${props => props.isToday ? '700' : '400'};
  color: ${props => {
    if (props.isEmpty) return 'transparent';
    if (props.active) return props.theme.light;
    return props.theme.secondary;
  }};
  position: relative;
  
  &:hover {
    ${props => !props.isEmpty && `
      transform: scale(1.1);
      z-index: 1;
    `}
  }
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
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activityData, setActivityData] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const userStats = await diaryService.getUserStats();
        setStats(userStats);
        
        // Convert activity calendar to map for easier date lookups
        const activityMap: Record<string, boolean> = {};
        for (let i = 0; i < userStats.activityCalendar.length; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const dateString = date.toISOString().split('T')[0];
          activityMap[dateString] = userStats.activityCalendar[i];
        }
        setActivityData(activityMap);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);
  
  // Handle calendar navigation
  const handleCalendarNavigation = (direction: 'prev' | 'next') => {
    setCalendarDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  // Handle year change from dropdown
  const handleYearChange = (year: number) => {
    setCalendarDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setFullYear(year);
      return newDate;
    });
  };
  
  // Generate year options for dropdown
  const renderYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Show 5 years back from current year
    for (let year = currentYear - 5; year <= currentYear; year++) {
      years.push(
        <option key={year} value={year}>
          {year}
        </option>
      );
    }
    
    return years;
  };
  
  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Get days in month for the calendar
  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 for Sunday
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add empty spaces for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<CalendarDay key={`empty-${i}`} active={false} isEmpty={true} />);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split('T')[0];
      const isActive = activityData[dateString] || false;
      const todayCheck = isToday(date);
      
      days.push(
        <CalendarDay 
          key={`day-${i}`} 
          active={isActive}
          isToday={todayCheck}
          title={`${date.toLocaleDateString()} ${isActive ? '- Entry added' : ''}`}
        >
          {i}
        </CalendarDay>
      );
    }
    
    return days;
  };

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
        <StreakTitle>Activity Calendar</StreakTitle>
        <StreakValue>{stats.currentStreak} days</StreakValue>
        <CalendarContainer>
          <CalendarHeader>
            <CalendarNavButton onClick={() => handleCalendarNavigation('prev')}>
              &lt;
            </CalendarNavButton>
            <CalendarControls>
              <CalendarMonthYear>
                {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CalendarMonthYear>
              <select 
                value={calendarDate.getFullYear()} 
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                style={{ 
                  padding: '4px',
                  borderRadius: '4px',
                  border: '1px solid #D7CCC8',
                  backgroundColor: '#FFF8E1',
                  color: '#5D4037'
                }}
              >
                {renderYearOptions()}
              </select>
            </CalendarControls>
            <CalendarNavButton onClick={() => handleCalendarNavigation('next')}>
              &gt;
            </CalendarNavButton>
          </CalendarHeader>
          <WeekdayLabels>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <WeekdayLabel key={i}>{day}</WeekdayLabel>
            ))}
          </WeekdayLabels>
          <CalendarGrid>
            {renderCalendarDays()}
          </CalendarGrid>
        </CalendarContainer>
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


