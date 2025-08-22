import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';
import diaryService from '../services/diaryService';

interface EntryPageProps {
  entry?: DiaryEntry;
  onSave: () => void;
  onCancel: () => void;
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

const EditorContainer = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - 140px);
`;

const EditorContent = styled.div`
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const EditorSidebar = styled.div`
  width: 280px;
  border-left: 1px solid ${({ theme }) => theme.border};
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background};
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

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.light};
  color: ${({ theme }) => theme.foreground};
  
  &:hover {
    background-color: ${({ theme }) => theme.border};
  }
`;

const SaveButton = styled(Button)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary + 'dd'};
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${({ theme }) => theme.danger || '#e53935'};
  color: white;
  
  &:hover {
    background-color: ${({ theme }) => theme.danger ? theme.danger + 'dd' : '#c62828'};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.foreground};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  font-size: 1rem;
  
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary + '20'};
  }
`;

const TitleInput = styled(Input)`
  font-size: 1.5rem;
  padding: 1rem 0;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  border-radius: 0;
  font-weight: 500;
  margin-bottom: 1.5rem;
  
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: calc(100vh - 300px);
  padding: 1rem 0;
  border: none;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  font-size: 1.1rem;
  line-height: 1.6;
  resize: none;
  
  &:focus {
    outline: none;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
`;

const SidebarTitle = styled.h3`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.secondary};
  margin: 0 0 1rem 0;
  font-weight: 600;
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.foreground};
`;

const ToggleSwitch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 40px;
  height: 20px;
  background-color: ${({ checked, theme }) => checked ? theme.primary : theme.border};
  border-radius: 10px;
  transition: background-color 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ checked }) => checked ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s ease;
  }
`;

const ToggleInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const ImageUploadArea = styled.div`
  padding: 1rem;
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 6px;
  text-align: center;
  margin-bottom: 1rem;
  cursor: pointer;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const UploadText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.secondary};
`;

const ImagePreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  border-radius: 4px;
  overflow: hidden;
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const EntryPage: React.FC<EntryPageProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      
      // Ensure correct date formatting regardless of timezone
      const entryDate = new Date(entry.date);
      const year = entryDate.getFullYear();
      const month = String(entryDate.getMonth() + 1).padStart(2, '0');
      const day = String(entryDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      
      setImages(entry.images || []);
      setIsLocked(entry.isLocked || false);
      setIsFavorite(entry.isFavorite || false);
    } else {
      // Default to today for new entries
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      
      setIsLocked(false);
      setIsFavorite(false);
    }
  }, [entry]);

  const handleSave = async () => {
    try {
      const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
      const selectedDate = new Date(year, month - 1, day);
      
      const entryData: Omit<DiaryEntry, 'id'> & { id?: string } = {
        title,
        content,
        date: selectedDate,
        createdAt: new Date(),
        images,
        isLocked,
        isFavorite,
        isRetroactive: false
      };

      if (entry?.id) {
        entryData.id = entry.id;
        entryData.createdAt = entry.createdAt;
        entryData.isRetroactive = entry.isRetroactive;
        await diaryService.updateEntry(entryData as DiaryEntry);
      } else {
        await diaryService.addEntry(entryData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save diary entry:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const target = e.target as FileReader;
        if (target && target.result && typeof target.result === 'string') {
          setImages(prev => [...prev, target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleDelete = async () => {
    if (!entry) return;
    
    try {
      await diaryService.deleteEntry(entry.id);
      onSave();
    } catch (error) {
      console.error('Failed to delete diary entry:', error);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          {entry ? 'Edit Entry' : 'New Entry'}
          {entry?.isRetroactive && (
            <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#888' }}>
              (Added retroactively)
            </span>
          )}
        </PageTitle>
        <ActionButtons>
          {entry && showDeleteConfirm && (
            <DeleteButton onClick={handleDelete}>
              Confirm Delete
            </DeleteButton>
          )}
          {entry && !showDeleteConfirm && (
            <DeleteButton onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </DeleteButton>
          )}
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <SaveButton onClick={handleSave}>Save</SaveButton>
        </ActionButtons>
      </PageHeader>
      
      <EditorContainer>
        <EditorContent>
          <TitleInput 
            type="text" 
            placeholder="Entry title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          
          <TextArea 
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </EditorContent>
        
        <EditorSidebar>
          <SidebarSection>
            <SidebarTitle>Entry Details</SidebarTitle>
            <FormGroup>
              <Label htmlFor="date">Date</Label>
              <Input 
                type="date" 
                id="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </FormGroup>
          </SidebarSection>
          
          <SidebarSection>
            <SidebarTitle>Images</SidebarTitle>
            <ImageUploadArea onClick={triggerImageUpload}>
              <UploadText>Click to add images</UploadText>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </ImageUploadArea>
            
            {images.length > 0 && (
              <ImagePreviewContainer>
                {images.map((image, index) => (
                  <ImagePreview key={index}>
                    <Image src={image} alt={`Image ${index + 1}`} />
                    <RemoveImageButton onClick={() => handleRemoveImage(index)}>×</RemoveImageButton>
                  </ImagePreview>
                ))}
              </ImagePreviewContainer>
            )}
          </SidebarSection>
          
          <SidebarSection>
            <SidebarTitle>Options</SidebarTitle>
            <ToggleGroup>
              <ToggleLabel htmlFor="lock-toggle">
                <ToggleInput 
                  type="checkbox" 
                  id="lock-toggle" 
                  checked={isLocked}
                  onChange={() => setIsLocked(!isLocked)}
                />
                <ToggleSwitch checked={isLocked} />
                <span>{isLocked ? '🔒 Entry Locked' : '🔓 Lock Entry'}</span>
              </ToggleLabel>

              <ToggleLabel htmlFor="favorite-toggle">
                <ToggleInput 
                  type="checkbox" 
                  id="favorite-toggle" 
                  checked={isFavorite}
                  onChange={() => setIsFavorite(!isFavorite)}
                />
                <ToggleSwitch checked={isFavorite} />
                <span>{isFavorite ? '⭐ Favorite' : '☆ Add to Favorites'}</span>
              </ToggleLabel>
            </ToggleGroup>
          </SidebarSection>
        </EditorSidebar>
      </EditorContainer>
    </PageContainer>
  );
};

export default EntryPage;
