import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';
import diaryService from '../services/diaryService';

interface MemoryViewProps {
  onSelectEntry: (entry: DiaryEntry) => void;
}

// Styled components
const MemoryContainer = styled.div`
  margin-bottom: 2rem;
`;

const MemoryHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const MemoryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  margin: 0;
`;

const MemoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.info};
  color: white;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.75rem;
`;

const MemoryCard = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.cardBackground};
  box-shadow: ${({ theme }) => theme.cardShadow};
  transition: transform 0.2s ease;
  cursor: pointer;
  border-left: 4px solid ${({ theme }) => theme.info};

  &:hover {
    transform: translateY(-2px);
  }
`;

const MemoryDate = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondary};
  display: block;
  margin-bottom: 0.5rem;
`;

const MemoryPreview = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.foreground};
  margin: 0;
`;

const NoMemoryMessage = styled.p`
  color: ${({ theme }) => theme.secondary};
  font-style: italic;
  font-size: 0.9rem;
`;

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper function to get entries from past years
const getMemoriesFromPast = (entries: DiaryEntry[]): DiaryEntry[] => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getMonth() === currentMonth &&
      entryDate.getDate() === currentDay &&
      entryDate.getFullYear() < today.getFullYear()
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const MemoryView: React.FC<MemoryViewProps> = ({ onSelectEntry }) => {
  const [memories, setMemories] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const loadMemories = async () => {
      try {
        const entries = await diaryService.getAllEntries();
        const pastMemories = getMemoriesFromPast(entries);
        setMemories(pastMemories);
      } catch (error) {
        console.error('Failed to load memories:', error);
        setMemories([]);
      }
    };
    
    loadMemories();
  }, []);

  if (memories.length === 0) {
    return null;
  }

  return (
    <MemoryContainer>
      <MemoryHeader>
        <MemoryTitle>On This Day</MemoryTitle>
        <MemoryBadge>Memories</MemoryBadge>
      </MemoryHeader>
      
      {memories.length > 0 ? (
        memories.map((memory) => {
          const yearsAgo = new Date().getFullYear() - new Date(memory.date).getFullYear();
          
          return (
            <MemoryCard key={memory.id} onClick={() => onSelectEntry(memory)}>
              <MemoryDate>
                {formatDate(new Date(memory.date))} ({yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago)
              </MemoryDate>
              <MemoryPreview>{memory.title}</MemoryPreview>
            </MemoryCard>
          );
        })
      ) : (
        <NoMemoryMessage>No memories found for today.</NoMemoryMessage>
      )}
    </MemoryContainer>
  );
};

export default MemoryView;