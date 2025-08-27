import React, { useState } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';
import { isEntryFromToday, formatDate as formatDateUtil } from '../utils/dateUtils';
import diaryService from '../services/diaryService';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ViewEntryPageProps {
  entry: DiaryEntry;
  onClose: () => void;
  onEdit: (entry: DiaryEntry) => void;
  onDelete?: () => void;
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

const EditButton = styled(Button)<{ disabled?: boolean }>`
  background-color: ${({ theme, disabled }) => disabled ? theme.border : theme.primary};
  color: ${({ disabled }) => disabled ? '#999' : 'white'};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.7 : 1};
  
  &:hover {
    background-color: ${({ theme, disabled }) => disabled ? theme.border : theme.primary + 'dd'};
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${({ theme }) => theme.danger || '#e53935'};
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.danger ? theme.danger + 'dd' : '#c62828'};
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
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
`;

const ImageItem = styled.div`
  border-radius: 8px;
  overflow: hidden;
  max-width: 250px;
  display: inline-block;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

// Use the utility function for formatting dates
const formatDate = (date: Date): string => {
  return formatDateUtil(date, 'long');
};

const ViewEntryPage: React.FC<ViewEntryPageProps> = ({ entry, onClose, onEdit, onDelete }) => {
  const isEditable = isEntryFromToday(entry);
  const [showNonEditableMessage, setShowNonEditableMessage] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleEditClick = () => {
    if (!isEditable) {
      setShowNonEditableMessage(true);
      setTimeout(() => setShowNonEditableMessage(false), 3000);
      return;
    }
    
    onEdit(entry);
  };
  
  const handleDelete = async () => {
    try {
      await diaryService.deleteEntry(entry.id);
      // Call onDelete callback to refresh the entries list
      if (onDelete) {
        onDelete();
      }
      onClose(); // Close the view and return to the list
    } catch (error) {
      console.error('Failed to delete diary entry:', error);
      alert('Failed to delete entry');
    }
  };
  return (
    <PageContainer>
      <DeleteConfirmationModal
        isVisible={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
      />
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
          <DeleteButton onClick={() => setShowDeleteConfirm(true)}>Delete</DeleteButton>
          <EditButton 
            onClick={handleEditClick} 
            disabled={!isEditable}
            title={isEditable ? 'Edit this entry' : 'Only today\'s entries can be edited'}
          >
            Edit
          </EditButton>
        </ActionButtons>
        {showNonEditableMessage && (
          <div style={{
            position: 'absolute',
            top: '70px',
            right: '20px',
            background: '#f8d7da',
            color: '#721c24',
            padding: '10px 15px',
            borderRadius: '4px',
            fontSize: '0.9rem',
            zIndex: 100,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}>
            Only today's entries can be edited.
          </div>
        )}
      </PageHeader>

      <EntryContainer>
        <EntryTitle>{entry.title}</EntryTitle>
        <EntryDate>
          {formatDate(new Date(entry.date))} • {entry.createdAt.toLocaleTimeString('en-US', { 
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </EntryDate>

        <StatusBadges>
          {entry.isLocked && (
            <StatusBadge>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Locked
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
