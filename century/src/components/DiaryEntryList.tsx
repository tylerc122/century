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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SearchSortContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SortSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const SortButton = styled.button<{ active: boolean }>`
  padding: 0.5rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ active, theme }) => active ? theme.primary : theme.secondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.light};
  }
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
`;

const NewEntryButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.primary + 'dd'};
  }
`;

const EntryList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
`;

const EntryCard = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.cardBackground};
  box-shadow: ${({ theme }) => theme.cardShadow};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  position: relative;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.foreground};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EntryDate = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.secondary};
  display: block;
  margin: 0.25rem 0;
`;

const EntryPreview = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.foreground};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin: 0;
  flex: 1;
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
        <Title>My Diary Entries</Title>
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
