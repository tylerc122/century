import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';
import diaryService from '../services/diaryService';
import DiaryEntryForm from '../components/DiaryEntryForm';
import MemoryView from '../components/MemoryView';

// Mock data for initial display
const mockEntries: DiaryEntry[] = [
  {
    id: '1',
    date: new Date('2024-08-20'),
    title: 'My First Entry',
    content: 'Today I started using Century, my new diary app!',
    images: []
  },
  {
    id: '2',
    date: new Date('2024-08-19'),
    title: 'Planning My Week',
    content: 'I need to organize my tasks for the upcoming week...',
    images: []
  }
];

// Styled components
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.background};
`;

const EntriesHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1rem;
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

const SortSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.cardBackground};
  color: ${({ theme }) => theme.foreground};
  cursor: pointer;
  font-size: 0.95rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(
    '#8D6E63'
  )}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
  padding-right: 2.5rem;
  transition: all 0.3s ease;
  letter-spacing: 0.01em;
  font-weight: 500;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary + '40'};
    border-color: ${({ theme }) => theme.primary};
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.secondary};
  }
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

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
`;

const NewEntryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.primary + 'DD'});
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px ${({ theme }) => theme.primary + '40'};
  letter-spacing: 0.02em;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }

  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.primary + 'EE'}, ${({ theme }) => theme.primary});
    transform: translateY(-2px);
    box-shadow: 0 6px 15px ${({ theme }) => theme.primary + '50'};
    
    &::after {
      left: 100%;
    }
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary + '40'}, 0 4px 10px ${({ theme }) => theme.primary + '40'};
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px ${({ theme }) => theme.primary + '40'};
  }
`;

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
`;

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit'
  });
};

const DiaryEntryList: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showEntryForm, setShowEntryForm] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortCriteria, setSortCriteria] = useState<'date' | 'title' | 'favorite'>('date');
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const loadedEntries = await diaryService.getAllEntries();
      const entriesList = loadedEntries.length > 0 ? loadedEntries : mockEntries;
      setEntries(entriesList);
      applyFiltersAndSort(entriesList, searchQuery, sortCriteria, sortAscending);
    } catch (error) {
      console.error('Failed to load entries:', error);
      setEntries(mockEntries);
      applyFiltersAndSort(mockEntries, searchQuery, sortCriteria, sortAscending);
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

  return (
    <Container>
      <EntriesHeader>
        <NewEntryButton onClick={() => setShowEntryForm(true)}>New Entry</NewEntryButton>
      </EntriesHeader>

      <SearchSortContainer>
        <SearchInput 
          type="text" 
          placeholder="Search entries..." 
          value={searchQuery}
          onChange={handleSearch}
        />
        <SortSelect value={sortCriteria} onChange={handleSortChange}>
          <option value="date">Date</option>
          <option value="title">Title</option>
          <option value="favorite">Favorites</option>
        </SortSelect>
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
                  {entry.isLocked && <EntryStatusIcon>🔒</EntryStatusIcon>}
                  {entry.isFavorite && <EntryStatusIcon>⭐</EntryStatusIcon>}
                </EntryStatusIcons>
              </EntryCardHeader>
              <EntryDate>{formatDate(entry.date)}</EntryDate>
              <EntryPreview>{entry.content}</EntryPreview>
            </EntryCard>
          ))
        ) : (
          <EmptyMessage>
            {entries.length === 0 ? 
              "No entries yet. Create your first entry!" : 
              "No entries match your search."}
          </EmptyMessage>
        )}
      </EntryList>

      {showEntryForm && (
        <DiaryEntryForm 
          onSave={() => {
            setShowEntryForm(false);
            loadEntries();
          }}
          onCancel={() => setShowEntryForm(false)}
        />
      )}
      
      {selectedEntry && (
        <DiaryEntryForm 
          entry={selectedEntry}
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
