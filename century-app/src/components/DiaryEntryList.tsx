import React, { useState } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';

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
`;

const NewEntryButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0069d9;
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
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
`;

const EntryDate = styled.span`
  font-size: 0.85rem;
  color: #6c757d;
  display: block;
  margin-bottom: 0.5rem;
`;

const EntryPreview = styled.p`
  font-size: 0.9rem;
  color: #343a40;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  const [entries] = useState<DiaryEntry[]>(mockEntries);
  
  return (
    <Container>
      <EntriesHeader>
        <Title>My Diary Entries</Title>
        <NewEntryButton>New Entry</NewEntryButton>
      </EntriesHeader>
      
      <EntryList>
        {entries.map((entry) => (
          <EntryCard key={entry.id}>
            <EntryTitle>{entry.title}</EntryTitle>
            <EntryDate>{formatDate(entry.date)}</EntryDate>
            <EntryPreview>{entry.content}</EntryPreview>
          </EntryCard>
        ))}
      </EntryList>
    </Container>
  );
};

export default DiaryEntryList;