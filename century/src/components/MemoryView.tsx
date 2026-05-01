import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';
import diaryService from '../services/diaryService';
import PasswordModal from './PasswordModal';

interface MemoryViewProps {
  onSelectEntry: (entry: DiaryEntry) => void;
  onViewEntry?: (entry: DiaryEntry) => void;
  entries?: DiaryEntry[];
}

// Styled components
const MemoryContainer = styled.div`
  margin-bottom: 1.25rem;
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
  background: linear-gradient(135deg, ${({ theme }) => theme.info}, ${({ theme }) => theme.accent2});
  color: white;
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.75rem;
`;

const MemoryCard = styled.div<{ isLocked?: boolean }>`
  padding: 1rem 1.15rem;
  border-radius: 8px;
  background:
    linear-gradient(135deg, ${({ theme }) => theme.cardBackground} 0%, ${({ theme }) => theme.light} 100%);
  box-shadow: ${({ theme }) => theme.cardShadow};
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.border};
  border-left: 4px solid ${({ theme }) => theme.info};
  position: relative;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 38px rgba(86, 57, 43, 0.14);
  }
`;



const MemoryDate = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.secondary};
  display: block;
  margin-bottom: 0.5rem;
`;

const MemoryPreview = styled.p<{ isLocked?: boolean }>`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.foreground};
  margin: 0;
  filter: ${({ isLocked }) => isLocked ? 'blur(5px)' : 'none'};
  transition: filter 0.3s ease;
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

const MemoryView: React.FC<MemoryViewProps> = ({ onSelectEntry, onViewEntry, entries }) => {
  const [memories, setMemories] = useState<DiaryEntry[]>([]);
  const [passwordModalVisible, setPasswordModalVisible] = useState<boolean>(false);
  const [selectedLockedEntry, setSelectedLockedEntry] = useState<DiaryEntry | null>(null);

  useEffect(() => {
    const loadMemories = async () => {
      try {
        const sourceEntries = entries ?? await diaryService.getAllEntries();
        const pastMemories = getMemoriesFromPast(sourceEntries);
        setMemories(pastMemories);
      } catch (error) {
        console.error('Failed to load memories:', error);
        setMemories([]);
      }
    };
    
    loadMemories();
  }, [entries]);

  const handleMemoryClick = (memory: DiaryEntry) => {
    if (memory.isLocked) {
      setSelectedLockedEntry(memory);
      setPasswordModalVisible(true);
    } else if (onViewEntry) {
      onViewEntry(memory);
    } else {
      onSelectEntry(memory);
    }
  };

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
            <MemoryCard 
              key={memory.id} 
              onClick={() => handleMemoryClick(memory)}
              isLocked={memory.isLocked}
            >
              <MemoryDate>
                {formatDate(new Date(memory.date))} ({yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago)
              </MemoryDate>
              <MemoryPreview isLocked={memory.isLocked}>{memory.title}</MemoryPreview>

            </MemoryCard>
          );
        })
      ) : (
        <NoMemoryMessage>No memories found for today.</NoMemoryMessage>
      )}
      
      {/* Password Modal for locked entries */}
      <PasswordModal 
        isVisible={passwordModalVisible}
        onUnlock={() => {
          if (selectedLockedEntry) {
            if (onViewEntry) {
              onViewEntry(selectedLockedEntry);
            } else {
              onSelectEntry(selectedLockedEntry);
            }
            setPasswordModalVisible(false);
            setSelectedLockedEntry(null);
          }
        }}
        onCancel={() => {
          setPasswordModalVisible(false);
          setSelectedLockedEntry(null);
        }}
      />
    </MemoryContainer>
  );
};

export default MemoryView;
