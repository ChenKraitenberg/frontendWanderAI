// src/components/ProfileImageUploader.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import userService from '../services/user_service';
import { getImageUrl } from '../utils/imageUtils';

interface ProfileImageUploaderProps {
  currentImage?: string | null;
  onImageUpdate: (newImageUrl: string) => void;
  userId: string;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false); // Move this inside the component

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    try {
      setUploading(true);

      // Use the uploadImage method
      const uploadResponse = await userService.uploadImage(file);
      const response = await uploadResponse.request;
      const imageUrl = response.data.url;
      // Update profile with the new avatar
      await userService.updateProfile({
        avatar: imageUrl,
      });

      // Update UI
      onImageUpdate(imageUrl);
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Failed to update profile image:', error);
      toast.error('Error updating profile image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="position-relative">
      <div
        className="rounded-4 shadow-lg border-4 border-white"
        style={{
          width: '120px',
          height: '120px',
          backgroundImage: currentImage ? `url(${getImageUrl(currentImage)})` : 'url(/api/placeholder/120/120)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById('profileImageInput')?.click()}>
        {uploading && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 rounded-4">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 shadow-sm" style={{ transform: 'translate(30%, 30%)' }}>
          <span className="text-white">📷</span>
        </div>
      </div>

      <input id="profileImageInput" type="file" accept="image/jpeg, image/png, image/gif" className="d-none" onChange={handleImageChange} />
    </div>
  );
};

export default ProfileImageUploader;
