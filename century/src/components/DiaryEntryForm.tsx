import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';
import diaryService from '../services/diaryService';
import { isEntryFromToday } from '../utils/dateUtils';

interface DiaryEntryFormProps {
  entry?: DiaryEntry;
  onSave: () => void;
  onCancel: () => void;
}

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const FormContainer = styled.div`
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.cardShadow};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const WarningBanner = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const WarningText = styled.span`
  flex: 1;
`;

const CloseWarningButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #721c24;
  padding: 0 0 0 1rem;
  line-height: 1;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  margin: 0;
`;

const FormContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.foreground};
`;

const Input = styled.input<{ disabled?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  font-size: 1rem;
  
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

const TextArea = styled.textarea<{ disabled?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
  font-size: 1rem;
  min-height: 200px;
  resize: vertical;
  
  &:focus {
    border-color: ${({ theme }) => theme.primary};
    outline: none;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const RightActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
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

// Delete button removed - functionality moved to ViewEntryPage

const ImageUploadArea = styled.div`
  padding: 1rem;
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 4px;
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ImagePreview = styled.div<{ isCover?: boolean }>`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
  border: ${({ isCover }) => isCover ? '2px solid #f0b979' : 'none'};
  box-shadow: ${({ isCover }) => isCover ? '0 0 8px rgba(240, 185, 121, 0.6)' : 'none'};
`;

const Image = styled.img`
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

const ImageActionButtons = styled.div`
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ImagePreview}:hover & {
    opacity: 1;
  }
`;

const ImageActionButton = styled.button<{ disabled?: boolean }>`
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 14px;
  opacity: ${props => props.disabled ? '0.5' : '1'};
  
  &:hover {
    background-color: ${props => props.disabled ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)'};
  }
`;

const CoverBadge = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: rgba(240, 185, 121, 0.85);
  color: white;
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 10px;
  font-weight: bold;
`;

const ToggleGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const DiaryEntryForm: React.FC<DiaryEntryFormProps> = ({ entry, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [coverPhotos, setCoverPhotos] = useState<number[]>([0]); // Track cover photo indices (up to 4)
  // Delete functionality removed from edit view
  const [canEdit, setCanEdit] = useState(true);
  const [showEditWarning, setShowEditWarning] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      
      // Ensure correct date formatting regardless of timezone
      const entryDate = new Date(entry.date);
      const year = entryDate.getFullYear();
      const month = String(entryDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const day = String(entryDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      
      setImages(entry.images || []);
      setIsLocked(entry.isLocked || false);
      setIsFavorite(entry.isFavorite || false);
      
      // Initialize cover photos based on the saved entry
      // Since cover photos are stored at the beginning of the images array,
      // we need to identify how many there are (up to 4)
      if (entry.images && entry.images.length > 0) {
        // Assume the first images (up to 4) were cover photos
        const coverCount = Math.min(entry.images.length, 4);
        const initialCoverIndices = Array.from({ length: coverCount }, (_, i) => i);
        setCoverPhotos(initialCoverIndices);
      }
      
      // Check if entry is from today to enable editing
      const isToday = isEntryFromToday(entry);
      setCanEdit(isToday || !entry.id);
      setShowEditWarning(!isToday && !!entry.id);
    } else {
      // Default to today for new entries
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const day = String(today.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      
      setIsLocked(false);
      setIsFavorite(false);
    }
  }, [entry]);

  const handleSave = async () => {
    // Only allow saving if it's a new entry or today's entry
    if (entry?.id && !canEdit) {
      alert('Only today\'s entries can be edited.');
      return;
    }
    try {
      // Fix timezone issue with more thorough handling
      // Parse the date parts from the string to construct the date manually
      const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
      
      // Create date with the correct year, month (0-indexed), and day
      const selectedDate = new Date(year, month - 1, day);
      
      // Reorganize images to put cover photos first
      // Create a map of current positions
      const imageMap = new Map<number, string>();
      images.forEach((img, idx) => imageMap.set(idx, img));
      
      // Create the new order - cover photos first, then remaining images
      const newImages: string[] = [];
      
      // Add cover photos in order
      coverPhotos.sort((a, b) => a - b).forEach(index => {
        if (imageMap.has(index)) {
          newImages.push(imageMap.get(index)!);
          imageMap.delete(index);
        }
      });
      
      // Add remaining images
      imageMap.forEach((img) => {
        newImages.push(img);
      });
      
      const entryData: Omit<DiaryEntry, 'id'> & { id?: string } = {
        title,
        content,
        date: selectedDate,
        createdAt: new Date(), // Set creation date to now
        images: newImages, // Use the reordered images
        isLocked,
        isFavorite,
        isRetroactive: false // Will be determined by the service
      };

      if (entry?.id) {
        entryData.id = entry.id;
        entryData.createdAt = entry.createdAt; // Preserve original creation date
        entryData.isRetroactive = entry.isRetroactive; // Preserve retroactive status
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
    // Remove the image
    setImages(prev => prev.filter((_, i) => i !== index));
    
    // Update cover photo indices after removal
    setCoverPhotos(prev => {
      // Remove this index if it was a cover photo
      const newCoverPhotos = prev.filter(i => i !== index)
        // Adjust indices for photos after the removed one
        .map(i => i > index ? i - 1 : i);
      
      return newCoverPhotos;
    });
  };
  
  const handleSetCoverImage = (index: number) => {
    setCoverPhotos(prev => {
      // Check if image is already a cover photo
      if (prev.includes(index)) {
        // Remove it from cover photos
        return prev.filter(i => i !== index);
      } else if (prev.length < 4) {
        // Add as a new cover photo if less than 4
        return [...prev, index].sort((a, b) => a - b);
      } else {
        // Already have 4 cover photos, show message or handle differently
        alert('Maximum of 4 cover photos allowed');
        return prev;
      }
    });
  };
  
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setImages(prev => {
      const newImages = [...prev];
      
      if (direction === 'left' && index > 0) {
        // Swap with previous image
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      } else if (direction === 'right' && index < newImages.length - 1) {
        // Swap with next image
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      }
      
      return newImages;
    });
    
    // Update cover photo indices after moving
    setCoverPhotos(prev => {
      const updatedIndices = [...prev];
      
      // Update indices based on the move direction
      if (direction === 'left' && index > 0) {
        for (let i = 0; i < updatedIndices.length; i++) {
          if (updatedIndices[i] === index) updatedIndices[i] = index - 1;
          else if (updatedIndices[i] === index - 1) updatedIndices[i] = index;
        }
      } else if (direction === 'right' && index < images.length - 1) {
        for (let i = 0; i < updatedIndices.length; i++) {
          if (updatedIndices[i] === index) updatedIndices[i] = index + 1;
          else if (updatedIndices[i] === index + 1) updatedIndices[i] = index;
        }
      }
      
      return updatedIndices;
    });
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Delete functionality moved to ViewEntryPage

  return (
    <Overlay onClick={onCancel}>
      <FormContainer onClick={e => e.stopPropagation()}>
        <FormHeader>
          <FormTitle>
            {entry ? 'Edit Entry' : 'New Entry'}
            {entry?.isRetroactive && (
              <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#888' }}>
                (Added retroactively)
              </span>
            )}
          </FormTitle>
        </FormHeader>
        
        <FormContent>
          {showEditWarning && (
            <WarningBanner>
              <WarningText>
                <strong>Notice:</strong> This entry is from a past date and cannot be edited.
                Only today's entries can be modified.
              </WarningText>
              <CloseWarningButton onClick={() => setShowEditWarning(false)}>
                ×
              </CloseWarningButton>
            </WarningBanner>
          )}
          <FormGroup>
            <Label htmlFor="date">Date</Label>
            <Input 
              type="date" 
              id="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              disabled={!canEdit} 
            />

          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="title">Title</Label>
            <Input 
              type="text" 
              id="title" 
              placeholder="Entry title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canEdit}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="content">Content</Label>
            <TextArea 
              id="content" 
              placeholder="Write your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!canEdit}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Images <span style={{fontSize: '0.8rem', color: '#888'}}>(Select up to 4 cover photos)</span></Label>
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
                  <ImagePreview key={index} isCover={coverPhotos.includes(index)}>
                    <Image src={image} alt={`Image ${index + 1}`} />
                    {coverPhotos.includes(index) && (
                      <CoverBadge>
                        Cover {coverPhotos.indexOf(index) + 1}
                      </CoverBadge>
                    )}
                    <RemoveImageButton onClick={() => handleRemoveImage(index)}>×</RemoveImageButton>
                    <ImageActionButtons>
                      <ImageActionButton onClick={() => handleMoveImage(index, 'left')} disabled={index === 0}>&larr;</ImageActionButton>
                      <ImageActionButton 
                        onClick={() => handleSetCoverImage(index)}
                        title={coverPhotos.includes(index) ? 'Remove from covers' : 'Set as cover'}
                      >
                        {coverPhotos.includes(index) ? '★' : '☆'}
                      </ImageActionButton>
                      <ImageActionButton onClick={() => handleMoveImage(index, 'right')} disabled={index === images.length - 1}>&rarr;</ImageActionButton>
                    </ImageActionButtons>
                  </ImagePreview>
                ))}
              </ImagePreviewContainer>
            )}
          </FormGroup>

          <ToggleGroup>
            <ToggleLabel htmlFor="lock-toggle">
              <ToggleInput 
                type="checkbox" 
                id="lock-toggle" 
                checked={isLocked}
                onChange={() => setIsLocked(!isLocked)}
              />
              <ToggleSwitch checked={isLocked} />
              <span>
                {isLocked ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Entry Locked
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}>
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Lock Entry
                  </>
                )}
              </span>
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
        </FormContent>
        
        <FormActions>
          {/* Delete button removed - functionality moved to ViewEntryPage */}
          <div /> {/* Spacer element */}
          
          <RightActions>
            <CancelButton onClick={onCancel}>Cancel</CancelButton>
            <SaveButton onClick={handleSave}>Save</SaveButton>
          </RightActions>
        </FormActions>
      </FormContainer>
    </Overlay>
  );
};

export default DiaryEntryForm;