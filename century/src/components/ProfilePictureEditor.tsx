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

// --- Styled Components (Unchanged) ---

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

/**
 * A modal component for cropping and editing a profile picture.
 * * @param {string} imageSrc - The source URL of the **original, un-cropped** image.
 * @param {(croppedImage: string) => void} onSave - Callback that receives the cropped image as a base64 data URL.
 * @param {() => void} onCancel - Callback to close the modal.
 * @param {boolean} isOpen - Controls the modal's visibility.
 * * @important USAGE NOTE:
 * To allow users to re-edit their profile picture correctly, the parent component
 * must manage two separate image states:
 * 1. The original, full-resolution image uploaded by the user.
 * 2. The cropped image data URL returned by the `onSave` callback.
 * * Always pass the *original* image source to this component's `imageSrc` prop.
 * Use the cropped data URL for display purposes only (e.g., in an <img> avatar).
 * Failing to do this will cause the "whole picture is gone" issue on re-edit,
 * as the editor will receive an already-cropped image with no data to pan or zoom.
 */
const ProfilePictureEditor: React.FC<ProfilePictureEditorProps> = ({
  imageSrc,
  onSave,
  onCancel,
  isOpen
}) => {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y
    });
  }, [cropArea.x, cropArea.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const dx = e.clientX - dragStart.mouseX;
    const dy = e.clientY - dragStart.mouseY;

    setCropArea(prev => ({
      ...prev,
      x: dragStart.cropX + dx / prev.scale,
      y: dragStart.cropY + dy / prev.scale,
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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

  const handleReset = () => {
    setCropArea({ x: 0, y: 0, scale: 1 });
  };

  const handleSave = () => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const FINAL_SIZE = 256; // Output resolution for the avatar
      canvas.width = FINAL_SIZE;
      canvas.height = FINAL_SIZE;

      const { naturalWidth, naturalHeight } = img;
      const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
      const CROP_OVERLAY_SIZE = 200;

      // 1. Determine the 'cover' scale of the image within the container
      const coverScale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight);

      // 2. Find the center of the crop overlay relative to the container.
      // This is the point we want to extract from the source image.
      const cropCenterX_container = containerWidth / 2;
      const cropCenterY_container = containerHeight / 2;
      
      // 3. Reverse the user's transformations (scale and translate) to find
      // where this center point would be on the untransformed container.
      // The CSS is `scale(S) translate(X, Y)`. The effective translation is NOT scaled.
      // We solve for `p` in `C = S * (p - C) + C + T` where C is the center origin.
      // This simplifies to `p = C - T / S`.
      const sourceCenterX_container = cropCenterX_container - (cropArea.x * cropArea.scale) / cropArea.scale;
      const sourceCenterY_container = cropCenterY_container - (cropArea.y * cropArea.scale) / cropArea.scale;

      // 4. Convert the container-space coordinates to original image-space coordinates.
      // This involves removing the 'cover' scale and its centering offset.
      const coveredImgWidth = naturalWidth * coverScale;
      const coveredImgHeight = naturalHeight * coverScale;
      const initialOffsetX = (containerWidth - coveredImgWidth) / 2;
      const initialOffsetY = (containerHeight - coveredImgHeight) / 2;

      const sourceImage_centerX = (sourceCenterX_container - initialOffsetX) / coverScale;
      const sourceImage_centerY = (sourceCenterY_container - initialOffsetY) / coverScale;

      // 5. Calculate the size of the crop area on the original image.
      const sourceSize = CROP_OVERLAY_SIZE / (coverScale * cropArea.scale);

      // 6. Calculate the top-left corner for `drawImage` from the center and size.
      const sourceX = sourceImage_centerX - (sourceSize / 2);
      const sourceY = sourceImage_centerY - (sourceSize / 2);
      
      // 7. Draw the final circular image.
      ctx.beginPath();
      ctx.arc(FINAL_SIZE / 2, FINAL_SIZE / 2, FINAL_SIZE / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceSize, sourceSize,
        0, 0, FINAL_SIZE, FINAL_SIZE
      );
      
      const croppedImageDataUrl = canvas.toDataURL('image/png');
      onSave(croppedImageDataUrl);
    };
    
    img.src = imageSrc;
  };
  
  // Reset when a new image is passed in
  useEffect(() => {
    handleReset();
  }, [imageSrc]);

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onMouseDown={onCancel}>
      <ModalContent onMouseDown={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Edit Profile Picture</ModalTitle>
          <CloseButton onClick={onCancel}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
        </ModalHeader>

        <EditorContainer ref={containerRef}>
          <ImageContainer
            cropArea={cropArea}
            onMouseDown={handleMouseDown}
          >
            <EditableImage src={imageSrc} alt="Profile preview" draggable="false" />
          </ImageContainer>
          
          <CropOverlay />
        </EditorContainer>

        <ControlsContainer>
          <ControlGroup>
            <ControlLabel>Zoom</ControlLabel>
            <Slider
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={cropArea.scale}
              onChange={handleScaleChange}
            />
            <SliderValue>{Math.round(cropArea.scale * 100)}%</SliderValue>
          </ControlGroup>
        </ControlsContainer>

        <ButtonGroup>
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProfilePictureEditor;