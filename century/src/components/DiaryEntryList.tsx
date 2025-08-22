import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';
import diaryService from '../services/diaryService';
import DiaryEntryForm from '../components/DiaryEntryForm';
import MemoryView from '../components/MemoryView';

// Styled components
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.background};
  position: relative;
`;

const SearchSortContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  background-color: ${({ theme }) => theme.headerBackground};
  padding: 1rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.cardShadow};
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.foreground};
  font-size: 0.95rem;
  transition: all 0.3s ease;
  letter-spacing: 0.01em;
  
  &::placeholder {
    color: ${({ theme }) => theme.secondary};
    font-style: italic;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary + '40'};
    border-color: ${({ theme }) => theme.primary};
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.secondary};
  }
`;

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

const SortButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1rem;
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ active, theme }) => active ? theme.primary : theme.secondary};
  border: 1px solid ${({ theme, active }) => active ? theme.primary : theme.border};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
  
  &:hover {
    background-color: ${({ theme, active }) => active ? theme.primary + '10' : theme.light};
    border-color: ${({ theme, active }) => active ? theme.primary : theme.secondary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary + '40'};
  }
`;



// Removed unused component

const EntryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem;
`;

const EntryCard = styled.div`
  padding: 1.25rem;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.cardBackground};
  box-shadow: ${({ theme }) => theme.cardShadow};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.accent1});
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(93, 64, 55, 0.2);
    
    &::before {
      opacity: 1;
    }
  }
`;

const EntryCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
`;

const EntryStatusIcons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const EntryStatusIcon = styled.span`
  font-size: 0.85rem;
`;

const EntryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.foreground};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.01em;
`;

const EntryDate = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.secondary};
  display: block;
  margin: 0.35rem 0;
  font-weight: 500;
`;

const EntryPreview = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.foreground};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin: 0;
  flex: 1;
  line-height: 1.5;
  opacity: 0.9;
`;

const LoadingMessage = styled.div`
  padding: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.secondary};
`;

const EmptyMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.secondary};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.1rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit'
  });
};

interface DiaryEntryListProps {
  showEntryForm: boolean;
  setShowEntryForm: (show: boolean) => void;
  selectedEntry?: DiaryEntry;
  setSelectedEntry: (entry: DiaryEntry | undefined) => void;
}

const DiaryEntryList: React.FC<DiaryEntryListProps> = ({ 
  showEntryForm, 
  setShowEntryForm, 
  selectedEntry: propSelectedEntry, 
  setSelectedEntry 
}) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<'date' | 'title' | 'favorite'>('date');
  const [sortAscending, setSortAscending] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const loadedEntries = await diaryService.getAllEntries();
      setEntries(loadedEntries);
      applyFiltersAndSort(loadedEntries, searchQuery, sortCriteria, sortAscending);
    } catch (error) {
      console.error('Failed to load entries:', error);
      setEntries([]);
      setFilteredEntries([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFiltersAndSort = async (
    entriesList: DiaryEntry[], 
    query: string, 
    criteria: 'date' | 'title' | 'favorite', 
    ascending: boolean
  ) => {
    try {
      // Apply search filter
      let filtered = entriesList;
      if (query.trim()) {
        filtered = await diaryService.searchEntries(query);
      }
      
      // Apply sorting
      filtered = await diaryService.sortEntries(filtered, criteria, ascending);
      
      setFilteredEntries(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredEntries(entriesList);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFiltersAndSort(entries, query, sortCriteria, sortAscending);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const criteria = e.target.value as 'date' | 'title' | 'favorite';
    setSortCriteria(criteria);
    applyFiltersAndSort(entries, searchQuery, criteria, sortAscending);
  };
  
  const toggleSortDirection = () => {
    const newDirection = !sortAscending;
    setSortAscending(newDirection);
    applyFiltersAndSort(entries, searchQuery, sortCriteria, newDirection);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDropdownClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMenuItemClick = (criteria: 'date' | 'title' | 'favorite') => {
    setSortCriteria(criteria);
    applyFiltersAndSort(entries, searchQuery, criteria, sortAscending);
    setDropdownOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Container>
      <SearchSortContainer>
        <SearchInput 
          type="text" 
          placeholder="Search entries..." 
          value={searchQuery}
          onChange={handleSearch}
        />
        
        <StyledDropdownContainer className="dropdown-container" onClick={handleDropdownClick}>
          <DropdownHeader 
            className={dropdownOpen ? 'open' : ''}
          >
            {sortCriteria.charAt(0).toUpperCase() + sortCriteria.slice(1)}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </DropdownHeader>
          
          {/* Hidden accessible select for screen readers */}
          <HiddenSelect 
            value={sortCriteria} 
            onChange={handleSortChange}
            aria-label="Sort entries by"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="favorite">Favorites</option>
          </HiddenSelect>
          
          {dropdownOpen && (
            <DropdownMenu>
              <MenuItem 
                active={sortCriteria === 'date'} 
                onClick={() => handleMenuItemClick('date')}
              >
                {sortCriteria === 'date' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>} Date
              </MenuItem>
              <MenuItem 
                active={sortCriteria === 'title'} 
                onClick={() => handleMenuItemClick('title')}
              >
                {sortCriteria === 'title' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>} Title
              </MenuItem>
              <MenuItem 
                active={sortCriteria === 'favorite'} 
                onClick={() => handleMenuItemClick('favorite')}
              >
                {sortCriteria === 'favorite' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>} Favorites
              </MenuItem>
            </DropdownMenu>
          )}
        </StyledDropdownContainer>
        
        <SortButton 
          active={sortAscending} 
          onClick={toggleSortDirection}
        >
          {sortAscending ? '↑' : '↓'}
        </SortButton>
      </SearchSortContainer>

      <MemoryView onSelectEntry={setSelectedEntry} />
      
      <EntryList>
        {isLoading ? (
          <LoadingMessage>Loading entries...</LoadingMessage>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <EntryCard key={entry.id} onClick={() => setSelectedEntry(entry)}>
              <EntryCardHeader>
                <EntryTitle>{entry.title}</EntryTitle>
                <EntryStatusIcons>
                  {entry.isLocked && <EntryStatusIcon>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </EntryStatusIcon>}
                  {entry.isFavorite && <EntryStatusIcon>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </EntryStatusIcon>}
                  {entry.isRetroactive && <EntryStatusIcon title="Added retroactively">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="6" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12" y2="16"></line>
                    </svg>
                  </EntryStatusIcon>}
                </EntryStatusIcons>
              </EntryCardHeader>
              <EntryDate>{formatDate(entry.date)}</EntryDate>
              <EntryPreview>{entry.content}</EntryPreview>
            </EntryCard>
          ))
        ) : (
          <EmptyMessage>
            {entries.length === 0 ? (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <div>No entries yet. Click the + button to create your first entry!</div>
              </>
            ) : (
              "No entries match your search."
            )}
          </EmptyMessage>
        )}
      </EntryList>

      {/* Button moved to header */}

      {showEntryForm && (
        <DiaryEntryForm 
          onSave={() => {
            setShowEntryForm(false);
            loadEntries();
          }}
          onCancel={() => setShowEntryForm(false)}
        />
      )}
      
      {propSelectedEntry && (
        <DiaryEntryForm 
          entry={propSelectedEntry}
          onSave={() => {
            setSelectedEntry(undefined);
            loadEntries();
          }}
          onCancel={() => setSelectedEntry(undefined)}
        />
      )}
    </Container>
  );
};

export default DiaryEntryList;
