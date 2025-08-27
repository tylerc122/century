import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import styled from 'styled-components';
import diaryService, { UserStats } from '../services/diaryService';
import { DiaryEntry } from '../types';
import { supabase } from '../config/supabase';
import ProfilePictureEditor from './ProfilePictureEditor';
import storageService from '../services/storageService';

// Styled components
const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background};
  overflow: hidden;

  @media (max-width: 900px) {
    padding: 1rem;
    overflow: auto;
  }

  @media (max-width: 600px) {
    padding: 0.75rem;
    overflow: auto;
  }
`;

const DesktopLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
  width: 100%;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    height: auto;
    min-height: 100%;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  overflow-y: hidden;

  @media (max-width: 900px) {
    gap: 0.75rem;
    height: auto;
    overflow: visible;
  }
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: hidden;

  @media (max-width: 900px) {
    gap: 0.75rem;
    height: auto;
    overflow: visible;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 0.5rem;
  
  &:hover .avatar-edit-overlay {
    opacity: 1;
  }
`;

const Avatar = styled.div<{ hasImage: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.light};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.secondary};
  overflow: hidden;
  ${props => props.hasImage && `
    background-size: cover;
    background-position: center;
  `}
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarEditButton = styled.label`
  position: absolute;
  right: -5px;
  bottom: -5px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: ${({ theme }) => theme.dark};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const AvatarEditOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UsernameContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  position: relative;
`;

const Username = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  margin: 0;
  padding-right: 25px;
`;



const UsernameInput = styled.input`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  margin: 0;
  width: 100%;
`;

const EditButton = styled.button`
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.secondary};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const JoinedDate = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondary};
`;

const StatsContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
`;

const StatsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.foreground};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
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
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  overflow: visible;
  flex: 1;

  @media (max-width: 900px) {
    padding: 0.75rem;
    flex: none;
    overflow: visible;
  }
`;

const CalendarContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: visible;
  flex: 1;
  position: relative;

  @media (max-width: 900px) {
    flex: none;
    overflow: visible;
  }
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
  gap: 8px;
  margin-bottom: 0.5rem;
  width: 100%;
  justify-items: stretch;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.secondary};
  font-weight: 600;
  padding: 0.3rem 0;
  width: 100%;
`;

const WordStatsContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
`;

const WordStatsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.cardShadow};

  @media (max-width: 900px) {
    padding: 0.75rem;
    flex: none;
    min-height: 200px;
    overflow: visible;
  }
`;

const FavoriteEntriesTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.foreground};
`;

const FavoriteEntriesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  overflow-y: auto;

  @media (max-width: 900px) {
    gap: 0.4rem;
    max-height: none;
    overflow: visible;
  }
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
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Dropdown components
const StyledDropdownContainer = styled.div`
  position: relative;
  background-color: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 2px 6px rgba(93, 64, 55, 0.08);
  min-width: 120px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  color: ${({ theme }) => theme.foreground};
  font-weight: 500;
  font-size: 0.95rem;
  line-height: normal;
  width: 100%;
  
  svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
    transition: transform 0.2s ease;
  }
  
  &.open svg {
    transform: rotate(180deg);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 4px 12px rgba(93, 64, 55, 0.15);
  z-index: 100;
`;

const MenuItem = styled.div<{ active: boolean }>`
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  background-color: ${({ active }) => active ? `rgba(210, 105, 30, 0.15)` : 'transparent'};
  font-weight: ${({ active }) => active ? 500 : 400};
  
  &:hover {
    background-color: rgba(210, 105, 30, 0.08);
  }
  
  svg {
    margin-right: 8px;
    opacity: 0.8;
  }
`;

// Hidden actual select for accessibility
const HiddenSelect = styled.select`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const StreakTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.foreground};
`;


const StreakValue = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.foreground};
  text-align: center;
  margin-bottom: 0.5rem;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  width: 100%;
  margin: 0 auto;
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.light};
  border-radius: 8px;
  justify-items: stretch;
  align-items: center;
  overflow-y: auto;
  max-height: 500px;

  @media (max-width: 900px) {
    gap: 8px;
    padding: 0.4rem;
    max-height: none;
    overflow: visible;
  }

  @media (max-width: 600px) {
    gap: 6px;
    padding: 0.3rem;
    max-height: none;
    overflow: visible;
  }
`;

const CalendarDay = styled.div<{ active: boolean; isEmpty?: boolean; isToday?: boolean; isRetroactive?: boolean }>`
  background-color: ${props => {
    if (props.isEmpty) return 'transparent';
    if (props.active) {
      // Use a lighter color for retroactive entries
      return props.isRetroactive ? props.theme.primary + '80' : props.theme.primary;
    }
    return props.theme.border;
  }};
  border-radius: 4px;
  aspect-ratio: 1;
  width: 100%;
  min-width: 0;
  border: ${props => props.isEmpty ? 'none' : props.isToday ? `2px solid ${props.theme.dark}` : `1px solid ${props.theme.border}`};
  cursor: ${props => props.isEmpty ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: ${props => props.isToday ? '700' : '400'};
  color: ${props => {
    if (props.isEmpty) return 'transparent';
    if (props.active) return props.theme.light;
    return props.theme.secondary;
  }};
  position: relative;
  margin: 0;
  padding: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    ${props => !props.isEmpty && `
      opacity: 0.8;
      transform: scale(1.05);
      z-index: 5;
    `}
  }
  
  /* Add star icon indicator for retroactive entries */
  ${props => props.isRetroactive && `
    &::after {
      content: '\u2605';
      position: absolute;
      top: 2px;
      right: 2px;
      font-size: 8px;
      color: ${props.theme.light};
    }
  `}
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${({ theme }) => theme.secondary};
`;

const EntryPreview = styled.div<{ visible: boolean; position: { x: number; y: number } }>`
  position: absolute;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 12px;
  width: 250px;
  max-height: 200px;
  overflow: hidden;
  z-index: 100;
  left: 50%;
  top: ${props => `${props.position.y}px`};
  opacity: ${props => props.visible ? 1 : 0};
  visibility: ${props => props.visible ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  pointer-events: none;
  transform: translateX(-50%) translateY(-100%) translateY(-10px);
`;

const PreviewTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.foreground};
`;

const PreviewDate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.secondary};
  margin-bottom: 8px;
`;

const PreviewContent = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.foreground};
  opacity: 0.9;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`;

const LockedContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: ${({ theme }) => theme.secondary};
  padding: 10px 0;
`;

// Default joined date - will be replaced with actual user creation date
const defaultJoinedDate = new Date();

interface ProfileProps {
  onSelectEntry: (entry: DiaryEntry) => void;
}

const Profile: React.FC<ProfileProps> = ({ onSelectEntry }) => {
  const [stats, setStats] = useState<UserStats>({
    totalEntries: 0,
    totalWords: 0,
    currentStreak: 0,
    activityCalendar: Array(28).fill(false),
    retroactiveActivity: Array(28).fill(false),
    mostFrequentWord: 'None',
    totalMediaUploaded: 0,
    favoriteEntries: [] as DiaryEntry[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [joinedDate, setJoinedDate] = useState(defaultJoinedDate);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activityData, setActivityData] = useState<Record<string, boolean>>({});
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [previewEntry, setPreviewEntry] = useState<DiaryEntry | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('User');
  const [editingUsername, setEditingUsername] = useState<boolean>(false);
  const [tempUsername, setTempUsername] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [tempImageForEditing, setTempImageForEditing] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calendarGridRef = useRef<HTMLDivElement | null>(null);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);

  // Function to refresh profile data
  const refreshProfileData = async () => {
    try {
      const profileData = await diaryService.getUserProfile();
      setUsername(profileData.username);
      setProfilePicture(profileData.profilePicture);
    } catch (error) {
      console.error('Failed to refresh profile data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load user stats
        const userStats = await diaryService.getUserStats();
        setStats({ ...userStats, retroactiveActivity: userStats.retroactiveActivity || Array(28).fill(false) });
        
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
        
        // Load user profile data
        const profileData = await diaryService.getUserProfile();
        setUsername(profileData.username);
        setProfilePicture(profileData.profilePicture);
        
        // Get user creation date from auth (with caching)
        const cachedAuthData = storageService.getCachedAuthData();
        if (cachedAuthData) {
          console.log('Using cached auth data');
          setJoinedDate(new Date(cachedAuthData.createdAt));
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.created_at) {
            setJoinedDate(new Date(user.created_at));
            // Cache the auth data
            storageService.cacheAuthData({
              userId: user.id,
              createdAt: user.created_at
            });
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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
    setDropdownOpen(false);
  };
  
  const handleDropdownClick = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  const handleMenuItemClick = (year: number) => {
    handleYearChange(year);
    setDropdownOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.year-dropdown-container')) {
        setDropdownOpen(false);
      }
      
      // Also close username edit mode if clicking outside
      if (editingUsername && !target.closest('.username-edit-container')) {
        handleSaveUsername();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingUsername]);
  
  // Focus input when editing username
  useEffect(() => {
    if (editingUsername && usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, [editingUsername]);
  
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
  
  // Handle hover over calendar day
  const handleDayHover = useCallback(async (date: Date, event: React.MouseEvent) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    
    // Calculate position for the preview
    // Position directly above the day square
    const yPos = rect.top; // Base position at the top of the card (transform will move it above)
    
    setPreviewPosition({ x: 0, y: yPos }); // x position is ignored, using 50% left + transform translateX(-50%)
    
    hoverTimerRef.current = setTimeout(async () => {
      // Only show preview for days with entries
      const dateString = date.toISOString().split('T')[0];
      if (activityData[dateString]) {
        setPreviewLoading(true);
        try {
          const entry = await diaryService.getEntryByDate(date);
          if (entry) {
            setPreviewEntry(entry);
            setPreviewVisible(true);
          }
        } catch (error) {
          console.error('Error fetching entry preview:', error);
        } finally {
          setPreviewLoading(false);
        }
      }
    }, 500); // 500ms delay before showing preview
  }, [activityData]);
  
  // Handle mouse leave
  const handleDayLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setPreviewVisible(false);
  }, []);
  
  // Handle day click - allows viewing the full entry
  const handleDayClick = useCallback(async (date: Date) => {
    // Only handle click for days with entries
    const dateString = date.toISOString().split('T')[0];
    if (activityData[dateString]) {
      try {
        const entry = await diaryService.getEntryByDate(date);
        if (entry) {
          // Pass the entry to the parent component to display
          onSelectEntry(entry);
        }
      } catch (error) {
        console.error('Error fetching full entry:', error);
      }
    }
  }, [activityData, onSelectEntry]);
  
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
      
      // Check if this entry is retroactive
      const calDateString = date.toISOString().split('T')[0];
      const isRetroactive = stats.retroactiveActivity[stats.activityCalendar.findIndex(
        (_, index) => {
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - index);
          checkDate.setHours(0, 0, 0, 0);
          return checkDate.toISOString().split('T')[0] === calDateString;
        }
      )];

      days.push(
        <CalendarDay 
          key={`day-${i}`} 
          active={isActive}
          isToday={todayCheck}
          isRetroactive={isActive && isRetroactive}
          title={`${date.toLocaleDateString()} ${isActive ? isRetroactive ? '- Entry added retroactively' : '- Entry added' : ''}`}
          onMouseEnter={isActive ? (e) => handleDayHover(date, e) : undefined}
          onMouseLeave={isActive ? handleDayLeave : undefined}
          onClick={isActive ? () => handleDayClick(date) : undefined}
        >
          {i}
        </CalendarDay>
      );
    }
    
    return days;
  };

  // Handle username editing
  const handleEditUsername = () => {
    setTempUsername(username);
    setEditingUsername(true);
  };
  
  const handleSaveUsername = async () => {
    if (tempUsername.trim() && tempUsername !== username) {
      try {
        // Save to storage
        await diaryService.updateUserProfile({
          username: tempUsername.trim(),
          profilePicture
        });
        
        // Update local state only after successful save
        setUsername(tempUsername.trim());
        
        // Refresh profile data to ensure consistency
        await refreshProfileData();
      } catch (error) {
        console.error('Failed to save username:', error);
        // Revert the temporary username if save failed
        setTempUsername(username);
      }
    }
    setEditingUsername(false);
  };
  
  // Handle profile picture change
  const handleProfilePictureChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (e.target?.result) {
          const imageDataUrl = e.target.result.toString();
          setTempImageForEditing(imageDataUrl);
          setIsEditorOpen(true);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle saving the edited profile picture
  const handleSaveEditedPicture = async (croppedImage: string) => {
    try {
      // Save to storage
      await diaryService.updateUserProfile({
        username,
        profilePicture: croppedImage
      });
      
      // Update local state only after successful save
      setProfilePicture(croppedImage);
      setIsEditorOpen(false);
      setTempImageForEditing(null);
      
      // Refresh profile data to ensure consistency
      await refreshProfileData();
    } catch (error) {
      console.error('Failed to save profile picture:', error);
      // Keep the editor open if save failed
    }
  };

  // Handle canceling the editor
  const handleCancelEditor = () => {
    setIsEditorOpen(false);
    setTempImageForEditing(null);
  };

  // Handle editing existing profile picture
  const handleEditExistingPicture = () => {
    if (profilePicture) {
      setTempImageForEditing(profilePicture);
      setIsEditorOpen(true);
    }
  };



  if (isLoading) {
    return <LoadingMessage>Loading profile data...</LoadingMessage>;
  }

  return (
    <Container>
      <DesktopLayout>
        <LeftColumn>
          <ProfileHeader>
            <AvatarContainer>
              <Avatar hasImage={!!profilePicture}>
                {profilePicture ? (
                  <AvatarImage src={profilePicture} alt={username} />
                ) : (
                  username.charAt(0).toUpperCase()
                )}
              </Avatar>
              
              {/* Edit overlay for existing profile pictures */}
              {profilePicture && (
                <AvatarEditOverlay 
                  className="avatar-edit-overlay"
                  onClick={handleEditExistingPicture}
                  title="Edit profile picture"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </AvatarEditOverlay>
              )}
              
              <AvatarEditButton htmlFor="profile-picture-upload">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <circle cx="12" cy="14" r="4"></circle>
                </svg>
              </AvatarEditButton>
              <HiddenFileInput 
                id="profile-picture-upload" 
                type="file" 
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
            </AvatarContainer>
            
            <UsernameContainer className="username-edit-container">
              {editingUsername ? (
                <UsernameInput 
                  ref={usernameInputRef}
                  type="text" 
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                  maxLength={20}
                />
              ) : (
                <Username>{username}</Username>
              )}
              <EditButton 
                onClick={editingUsername ? handleSaveUsername : handleEditUsername}
                aria-label={editingUsername ? "Save username" : "Edit username"}
              >
                {editingUsername ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                )}
              </EditButton>
            </UsernameContainer>
            
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
            </StatsGrid>
          </StatsContainer>
          
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
                  <FavoriteEntryCard key={entry.id} onClick={() => onSelectEntry(entry)}>
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
        </LeftColumn>

        <RightColumn>
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
                    {calendarDate.toLocaleDateString('en-US', { month: 'long' })}
                  </CalendarMonthYear>
                  
                  <StyledDropdownContainer className="year-dropdown-container" onClick={handleDropdownClick}>
                    <DropdownHeader className={dropdownOpen ? 'open' : ''}>
                      {calendarDate.getFullYear()}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </DropdownHeader>
                    
                    {/* Hidden accessible select for screen readers */}
                    <HiddenSelect 
                      value={calendarDate.getFullYear()} 
                      onChange={(e) => handleYearChange(parseInt(e.target.value))}
                      aria-label="Select year"
                    >
                      {renderYearOptions()}
                    </HiddenSelect>
                    
                    {dropdownOpen && (
                      <DropdownMenu>
                        {(() => {
                          const currentYear = new Date().getFullYear();
                          const years = [];
                          
                          for (let year = currentYear - 5; year <= currentYear; year++) {
                            years.push(
                              <MenuItem 
                                key={year}
                                active={calendarDate.getFullYear() === year}
                                onClick={() => handleMenuItemClick(year)}
                              >
                                {calendarDate.getFullYear() === year && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>}
                                {year}
                              </MenuItem>
                            );
                          }
                          
                          return years;
                        })()}
                      </DropdownMenu>
                    )}
                  </StyledDropdownContainer>
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
              <CalendarGrid ref={calendarGridRef}>
                {renderCalendarDays()}
              </CalendarGrid>
              
              {/* Entry Preview Popup */}
              <EntryPreview 
                visible={previewVisible} 
                position={previewPosition}
              >
                {previewLoading ? (
                  <PreviewContent>Loading...</PreviewContent>
                ) : previewEntry ? (
                  previewEntry.isLocked ? (
                    <LockedContent>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      This entry is locked
                    </LockedContent>
                  ) : (
                    <>
                      <PreviewTitle>{previewEntry.title}</PreviewTitle>
                      <PreviewDate>{new Date(previewEntry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</PreviewDate>
                      <PreviewContent>{previewEntry.content}</PreviewContent>
                    </>
                  )
                ) : null}
              </EntryPreview>
            </CalendarContainer>
          </StreakContainer>
        </RightColumn>
      </DesktopLayout>
      
      {/* Profile Picture Editor Modal */}
      {tempImageForEditing && (
        <ProfilePictureEditor
          imageSrc={tempImageForEditing}
          onSave={handleSaveEditedPicture}
          onCancel={handleCancelEditor}
          isOpen={isEditorOpen}
        />
      )}
    </Container>
  );
};

export default Profile;


