import React, { useRef } from 'react';
import { getProfileImageUrl } from '../utils/imageUtils';

interface ProfileImageUploaderProps {
  currentImage?: string | null;
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ 
  currentImage, 
  onImageSelect, 
  disabled = false 
}) => {
  // Using useRef for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    console.log("File selected:", file.name);
    
    // Call the parent callback with the file
    onImageSelect(file);
  };

  // Function to trigger file input click
  const openFileSelector = () => {
    if (disabled) return;
    console.log("Opening file selector");
    // Use the ref to trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /*// Image URL to display
  const imageUrl = currentImage || 
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e0e0e0"/%3E%3C/svg%3E';
*/

let imageUrl = '';
  
if (currentImage) {
  // בדוק אם זה כבר object URL (בד"כ מתחיל ב-blob:)
  if (currentImage.startsWith('blob:') || currentImage.startsWith('data:')) {
    imageUrl = currentImage;
    console.log("Using direct blob/data URL:", imageUrl.substring(0, 50) + "...");
  } else {
    // אחרת, השתמש בפונקציית getProfileImageUrl
    imageUrl = getProfileImageUrl(currentImage);
    console.log("Using processed URL:", imageUrl.substring(0, 50) + "...");
  }
} else {
  // תמונת ברירת מחדל
  imageUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e0e0e0"/%3E%3C/svg%3E';
  console.log("Using default placeholder image");
}

  return (
    <div className="position-relative">
      {/* Main image container */}
      <div
        className={`rounded-4 shadow-lg border-4 border-white ${!disabled ? 'cursor-pointer' : ''}`}
        style={{
          width: '120px',
          height: '120px',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.7 : 1,
        }}
        onClick={disabled ? undefined : openFileSelector}>

        {/* Camera icon - מוצג רק אם אפשר לעדכן */}
        {!disabled && (
          <div 
            className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 shadow-sm" 
            style={{ transform: 'translate(30%, 30%)' }}>
            <span className="text-white">📷</span>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/jpeg, image/png, image/gif" 
        className="d-none" 
        onChange={handleImageChange} 
        disabled={disabled}
      />
    </div>
  );
};

export default ProfileImageUploader;