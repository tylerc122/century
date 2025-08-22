import React from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';

interface ViewEntryPageProps {
  entry: DiaryEntry;
  onClose: () => void;
  onEdit: (entry: DiaryEntry) => void;
}

// Styled components
const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
  overflow: auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.headerBackground || theme.background};
  z-index: 10;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
`;

const CloseButton = styled(Button)`
  background-color: ${({ theme }) => theme.light};
  color: ${({ theme }) => theme.foreground};
  
  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

const EditButton = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary + 'dd'};
  }
`;

const EntryContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const EntryTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  margin: 0 0 1rem 0;
`;

const EntryDate = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.secondary};
  margin-bottom: 2rem;
`;

const EntryContent = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.foreground};
`;

const StatusBadges = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.light};
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
`;

const ImagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 3rem;
`;

const ImagesTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.foreground};
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ImageItem = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ViewEntryPage: React.FC<ViewEntryPageProps> = ({ entry, onClose, onEdit }) => {
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          {entry.isRetroactive && (
            <span style={{ fontSize: '0.8rem', marginRight: '0.5rem', color: '#888' }}>
              (Added retroactively)
            </span>
          )}
          Diary Entry
        </PageTitle>
        <ActionButtons>
          <CloseButton onClick={onClose}>Close</CloseButton>
          <EditButton onClick={() => onEdit(entry)}>Edit</EditButton>
        </ActionButtons>
      </PageHeader>

      <EntryContainer>
        <EntryTitle>{entry.title}</EntryTitle>
        <EntryDate>{formatDate(new Date(entry.date))}</EntryDate>

        <StatusBadges>
          {entry.isLocked && (
            <StatusBadge>
              <span>🔒</span> Locked
            </StatusBadge>
          )}
          {entry.isFavorite && (
            <StatusBadge>
              <span>⭐</span> Favorite
            </StatusBadge>
          )}
        </StatusBadges>

        <EntryContent>{entry.content}</EntryContent>
        
        {entry.images && entry.images.length > 0 && (
          <ImagesContainer>
            <ImagesTitle>Photos</ImagesTitle>
            <ImageGrid>
              {entry.images.map((image, index) => (
                <ImageItem key={index}>
                  <Image src={image} alt={`Photo ${index + 1}`} />
                </ImageItem>
              ))}
            </ImageGrid>
          </ImagesContainer>
        )}
      </EntryContainer>
    </PageContainer>
  );
};

export default ViewEntryPage;
