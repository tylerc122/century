import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

interface ProfilePictureEditorProps {
  imageSrc: string;
  onSave: (croppedImage: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface CropArea {
  x: number;
  y: number;
  scale: number;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: #2c2c2e; /* Example theme value */
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #ffffff; /* Example theme value */
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #8e8e93; /* Example theme value */
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #3a3a3c; /* Example theme value */
    color: #ffffff; /* Example theme value */
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const EditorContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background-color: #1c1c1e; /* Example theme value */
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const ImageContainer = styled.div.attrs<{ cropArea: CropArea }>(props => ({
  style: {
    transform: `scale(${props.cropArea.scale}) translate(${props.cropArea.x}px, ${props.cropArea.y}px)`,
  }
}))<{ cropArea: CropArea }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: move;
  will-change: transform;
`;

const EditableImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
`;

const CropOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 3px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  z-index: 10;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ControlLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #ffffff; /* Example theme value */
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #3a3a3c; /* Example theme value */
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0a84ff; /* Example theme value */
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #0a84ff; /* Example theme value */
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.span`
  font-size: 0.8rem;
  color: #8e8e93; /* Example theme value */
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background-color: #0a84ff; /* Example theme value */
    color: white;
    
    &:hover {
      background-color: #359aff; /* Example theme value */
    }
  ` : `
    background-color: #3a3a3c; /* Example theme value */
    color: #ffffff; /* Example theme value */
    
    &:hover {
      background-color: #58585a; /* Example theme value */
    }
  `}
`;


const ProfilePictureEditor: React.FC<ProfilePictureEditorProps> = ({
  imageSrc,
  onSave,
  onCancel,
  isOpen
}) => {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, scale: 1 });
  const [minScale, setMinScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset and calculate min scale when image changes or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      const img = new Image();
      img.onload = () => {
        const container = containerRef.current;
        if (!container) return;

        const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
        const { naturalWidth, naturalHeight } = img;
        const CROP_OVERLAY_SIZE = 200;

        // Calculate the 'cover' scale of the image
        const coverScale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight);

        const coveredImgWidth = naturalWidth * coverScale;
        const coveredImgHeight = naturalHeight * coverScale;
        
        // Calculate the minimum scale required to ensure the image
        // can still cover the 200x200 crop area.
        const newMinScale = Math.max(
          CROP_OVERLAY_SIZE / coveredImgWidth,
          CROP_OVERLAY_SIZE / coveredImgHeight
        );
        
        setMinScale(newMinScale);
        setCropArea({ x: 0, y: 0, scale: 1 }); // Reset to default
      };
      img.src = imageSrc;
    }
  }, [imageSrc, isOpen]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ mouseX: e.clientX, mouseY: e.clientY, cropX: cropArea.x, cropY: cropArea.y });
  }, [cropArea.x, cropArea.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.mouseX;
    const dy = e.clientY - dragStart.mouseY;
    setCropArea(prev => ({ ...prev, x: dragStart.cropX + dx / prev.scale, y: dragStart.cropY + dy / prev.scale }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => { setIsDragging(false); }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scale = parseFloat(e.target.value);
    setCropArea(prev => ({ ...prev, scale }));
  };

  const handleReset = () => { setCropArea({ x: 0, y: 0, scale: 1 }); };

  const handleSave = () => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const FINAL_SIZE = 256;
      canvas.width = FINAL_SIZE;
      canvas.height = FINAL_SIZE;

      const { naturalWidth, naturalHeight } = img;
      const { width: cW, height: cH } = container.getBoundingClientRect();
      const CROP_SIZE = 200;

      const coverScale = Math.max(cW / naturalWidth, cH / naturalHeight);
      const initialOffsetX = (cW - naturalWidth * coverScale) / 2;
      const initialOffsetY = (cH - naturalHeight * coverScale) / 2;

      const source_container_center_x = cW / 2 - cropArea.x;
      const source_container_center_y = cH / 2 - cropArea.y;

      const sourceImage_centerX = (source_container_center_x - initialOffsetX) / coverScale;
      const sourceImage_centerY = (source_container_center_y - initialOffsetY) / coverScale;
      
      const sourceSize = CROP_SIZE / (coverScale * cropArea.scale);
      const sourceX = sourceImage_centerX - (sourceSize / 2);
      const sourceY = sourceImage_centerY - (sourceSize / 2);

      ctx.beginPath();
      ctx.arc(FINAL_SIZE / 2, FINAL_SIZE / 2, FINAL_SIZE / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, FINAL_SIZE, FINAL_SIZE);
      
      const croppedImageDataUrl = canvas.toDataURL('image/png');
      onSave(croppedImageDataUrl);
    };
    
    img.src = imageSrc;
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onMouseDown={onCancel}>
      <ModalContent onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Edit Profile Picture</ModalTitle>
          <CloseButton onClick={onCancel}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
        </ModalHeader>

        <EditorContainer ref={containerRef}>
          <ImageContainer cropArea={cropArea} onMouseDown={handleMouseDown}>
            <EditableImage src={imageSrc} alt="Profile preview" draggable="false" />
          </ImageContainer>
          <CropOverlay />
        </EditorContainer>

        <ControlsContainer>
          <ControlGroup>
            <ControlLabel>Zoom</ControlLabel>
            <Slider
              type="range"
              min={minScale}
              max="3"
              step="0.01"
              value={cropArea.scale}
              onChange={handleScaleChange}
            />
            <SliderValue>{Math.round((cropArea.scale / minScale) * 100)}%</SliderValue>
          </ControlGroup>
        </ControlsContainer>

        <ButtonGroup>
          <Button variant="secondary" onClick={handleReset}>Reset</Button>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProfilePictureEditor;