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
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EntryCard = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.cardBackground};
  box-shadow: ${({ theme }) => theme.cardShadow};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const EntryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.foreground};
`;

const EntryDate = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondary};
  display: block;
  margin-bottom: 0.5rem;
`;

const EntryPreview = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.foreground};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const DiaryEntryList: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showEntryForm, setShowEntryForm] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | undefined>(undefined);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const loadedEntries = await diaryService.getAllEntries();
      setEntries(loadedEntries.length > 0 ? loadedEntries : mockEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
      setEntries(mockEntries);
    } finally {
      setIsLoading(false);
    }
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

      <MemoryView onSelectEntry={setSelectedEntry} />
      
      <EntryList>
        {isLoading ? (
          <LoadingMessage>Loading entries...</LoadingMessage>
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <EntryCard key={entry.id} onClick={() => setSelectedEntry(entry)}>
              <EntryTitle>{entry.title}</EntryTitle>
              <EntryDate>{formatDate(entry.date)}</EntryDate>
              <EntryPreview>{entry.content}</EntryPreview>
            </EntryCard>
          ))
        ) : (
          <EmptyMessage>No entries yet. Create your first entry!</EmptyMessage>
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
