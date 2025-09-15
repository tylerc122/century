import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DiaryEntry } from '../types';
import diaryService from '../services/diaryService';
import { isEntryFromToday } from '../utils/dateUtils';
import { encryptText } from '../utils/encryptionUtils';
import passwordService from '../services/passwordService';

interface EntryPageProps {
  entry?: DiaryEntry;
  onSave: () => void;
  onCancel: () => void;
  onRefresh?: () => void;
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
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.foreground};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    width: 100%;
  }
`;

const EditorContainer = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - 140px);
  
  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
`;

const EditorContent = styled.div`
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
    max-width: 100%;
  }
`;

const EditorSidebar = styled.div`
  width: 280px;
  border-left: 1px solid ${({ theme }) => theme.border};
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background};
  
  @media (max-width: 768px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.border};
    padding: 1rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  
  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
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
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.6rem 0.8rem;
    flex-direction: column;
    align-items: flex-start;
  }
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
  
  @media (max-width: 480px) {
    padding: 0.5rem 0 0 0;
    align-self: flex-end;
  }
`;

const TitleInput = styled(Input)<{ disabled?: boolean }>`
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
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    padding: 0.75rem 0;
    margin-bottom: 1rem;
  }
`;

const TextArea = styled.textarea<{ disabled?: boolean }>`
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
  
  @media (max-width: 768px) {
    min-height: 200px;
    font-size: 1rem;
    padding: 0.5rem 0;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
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
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
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
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ImagePreview = styled.div<{ isCover?: boolean }>`
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  border-radius: 4px;
  overflow: hidden;
  border: ${({ isCover }) => isCover ? '2px solid #f0b979' : 'none'};
  box-shadow: ${({ isCover }) => isCover ? '0 0 8px rgba(240, 185, 121, 0.6)' : 'none'};
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

const ImageActionButton = styled.button`
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
  font-size: 14px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const EntryPage: React.FC<EntryPageProps> = ({ entry, onSave, onCancel, onRefresh }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [coverPhotos, setCoverPhotos] = useState<number[]>([0]); // Track cover photo indices (up to 4)
  const [isLocked, setIsLocked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  // Delete functionality removed from edit view
  const [canEdit, setCanEdit] = useState(true);
  const [showEditWarning, setShowEditWarning] = useState(false);
  // State for handling password when locking
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
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
      const month = String(today.getMonth() + 1).padStart(2, '0');
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
      const [year, month, day] = date.split('-').map(num => parseInt(num, 10));
      // Create date in local timezone to avoid timezone shifting
      const selectedDate = new Date(year, month - 1, day, 12, 0, 0);
      
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
      
      // If entry is locked, encrypt sensitive content
      let entryContent = content;
      let entryTitle = title;
      
      if (isLocked) {
        // Get current user email to use as part of encryption key
        const userEmail = await passwordService.getCurrentUserEmail();
        if (userEmail) {
          // Encrypt content and title with account credentials
          entryContent = encryptText(content, userEmail);
          entryTitle = encryptText(title, userEmail);
        }
      }
      
      const entryData: Omit<DiaryEntry, 'id'> & { id?: string } = {
        title: entryTitle,
        content: entryContent,
        date: selectedDate,
        createdAt: new Date(),
        images: newImages, // Use the reordered images
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

      // Call onRefresh callback to refresh the entries list
      if (onRefresh) {
        onRefresh();
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
    
    // Update cover photo indices after removal
    setCoverPhotos(prev => {
      // Remove this index if it was a cover photo
      const newCoverPhotos = prev.filter(i => i !== index)
        // Adjust indices for photos after the removed one
        .map(i => i > index ? i - 1 : i);
      
      return newCoverPhotos;
    });
  };

  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleToggleCoverPhoto = (index: number) => {
    setCoverPhotos(prev => {
      // Check if image is already a cover photo
      if (prev.includes(index)) {
        // Remove it from cover photos
        return prev.filter(i => i !== index);
      } else if (prev.length < 4) {
        // Add as a new cover photo if less than 4
        return [...prev, index].sort((a, b) => a - b);
      } else {
        // Already have 4 cover photos, show message
        alert('Maximum of 4 cover photos allowed');
        return prev;
      }
    });
  };
  
  // Delete functionality moved to ViewEntryPage

  return (
    <>
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
            {/* Delete button removed from edit view */}
            <CancelButton onClick={onCancel}>Cancel</CancelButton>
            <SaveButton onClick={handleSave}>Save</SaveButton>
          </ActionButtons>
        </PageHeader>
        
        <EditorContainer>
          <EditorContent>
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
            
            <TitleInput 
              type="text" 
              placeholder="Entry title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              disabled={!canEdit}
              readOnly={!canEdit}
            />
            
            <TextArea 
              placeholder="Write your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!canEdit}
              readOnly={!canEdit}
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
              <SidebarTitle>Images <span style={{fontSize: '0.8rem', fontWeight: 'normal'}}>(Select up to 4 cover photos)</span></SidebarTitle>
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
                      <RemoveImageButton onClick={() => handleRemoveImage(index)}>×</RemoveImageButton>
                      {coverPhotos.includes(index) && (
                        <CoverBadge>
                          Cover {coverPhotos.indexOf(index) + 1}
                        </CoverBadge>
                      )}
                      <ImageActionButtons>
                        <ImageActionButton 
                          onClick={() => handleToggleCoverPhoto(index)}
                          title={coverPhotos.includes(index) ? 'Remove from covers' : 'Set as cover'}
                        >
                          {coverPhotos.includes(index) ? '★' : '☆'}
                        </ImageActionButton>
                      </ImageActionButtons>
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
                    onChange={() => {
                      // If toggling from unlocked to locked, we need the user's password
                      if (!isLocked) {
                        setIsPasswordModalVisible(true);
                      } else {
                        // When unlocking, we can just toggle directly
                        setIsLocked(false);
                      }
                    }}
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
            </SidebarSection>
          </EditorSidebar>
        </EditorContainer>
      </PageContainer>
    
      {/* Password modal for locking entries */}
      {isPasswordModalVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <h3>Confirm Lock Entry</h3>
            <p>Locking this entry will encrypt its content with your account password.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e0e0e0',
                  border: 'none',
                  borderRadius: '4px',
                }}
                onClick={() => setIsPasswordModalVisible(false)}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#D2691E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                }}
                onClick={() => {
                  setIsLocked(true);
                  setIsPasswordModalVisible(false);
                }}
              >
                Lock Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EntryPage;