// src/components/ProfileImageUploader.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import userService from '../services/user_service';
import { getImageUrl } from '../utils/imageUtils';
import apiClient from '../services/api-client';

interface ProfileImageUploaderProps {
  currentImage?: string | null;
  onImageUpdate: (newImageUrl: string) => void;
  userId: string;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ currentImage, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);

  // src/components/ProfileImageUploader.tsx - updated handleImageChange function
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    try {
      setUploading(true);

      // Create a FormData object matching the server's expectations
      const formData = new FormData();

      // Change this line - use 'image' instead of 'file' to match server expectations
      formData.append('image', file);

      console.log('Uploading file:', file.name);

      // Use direct axios for debugging
      const uploadResponse = await apiClient.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', uploadResponse);

      // Get the image URL
      const imageUrl = uploadResponse.data.url;
      console.log('Image URL:', imageUrl);

      // Update profile
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
