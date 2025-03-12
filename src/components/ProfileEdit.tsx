import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUploader from './ProfileImageUploader';
import { useAuth } from '../context/AuthContext';
import userService from '../services/user_service';

interface ProfileEditProps {
  user: {
    _id: string;
    email: string;
    name?: string;
    avatar?: string | null;
  };
  onUpdate: (updatedUser: { name?: string; avatar?: string }) => void;
  onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onUpdate, onCancel }) => {
  const [name, setName] = useState(user.name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { updateUserProfile } = useAuth();

  // Handle profile image selection
  const handleProfileImageSelect = (file: File) => {
    console.log('Profile image selected:', file.name);
    
    // Keep the file for later upload
    setSelectedImageFile(file);
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewImageUrl(objectUrl);
    
    // Mark that changes have been made
    setHasChanges(true);
  };

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Check if name has changed from original
    setHasChanges(newName !== user.name || selectedImageFile !== null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!hasChanges) {
      toast.info('No changes to save');
      onCancel();
      return;
    }

    try {
      setIsSubmitting(true);

      // Build the update data object
      const updatedData: { name?: string; avatar?: string } = {};

      // Include name if changed
      if (name !== user.name) {
        updatedData.name = name.trim();
      }

      // Upload image if a new one was selected
      if (selectedImageFile) {
        try {
          console.log('Uploading profile image...', selectedImageFile.name);
          toast.info('Uploading profile image...');
          
          const uploadResponse = await userService.uploadProfileImage(selectedImageFile);
          console.log('Upload response:', uploadResponse);
          
          if (uploadResponse && uploadResponse.url) {
            console.log('Image uploaded successfully, URL:', uploadResponse.url);
            updatedData.avatar = uploadResponse.url;
          } else {
            console.error('Upload response missing URL:', uploadResponse);
            throw new Error('Invalid upload response');
          }
        } catch (uploadError) {
          console.error('Failed to upload profile image:', uploadError);
          toast.error('Failed to upload new profile image');
          throw uploadError;
        }
      }

      console.log('Updating user profile with data:', updatedData);
      
      // Update the user profile
      if (Object.keys(updatedData).length > 0) {
        await updateUserProfile(updatedData);
      } else {
        console.log('No changes to update');
      }

      // Notify parent component about the update
      onUpdate(updatedData);

      // Clean up preview URL
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Clean up any created object URLs
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
    
    // Reset all form state
    setSelectedImageFile(null);
    setPreviewImageUrl(null);
    setName(user.name || '');
    setHasChanges(false);
    
    // Notify parent component
    onCancel();
  };

  // Get the image URL to display
  const displayImageUrl = previewImageUrl || user.avatar || null;

  return (
    <div className="card border-0 shadow-lg rounded-4">
      <div className="card-body p-4">
        <h3 className="h5 mb-4">Edit Profile</h3>

        <form onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="text-center mb-4">
          <ProfileImageUploader 
              currentImage={displayImageUrl} 
              onImageSelect={handleProfileImageSelect} 
              disabled={isSubmitting}
            />
            <p className="text-muted small mt-2">Click on the image to change your profile picture</p>
            {selectedImageFile && (
              <div className="text-success small">
                New image selected: {selectedImageFile.name}
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="mb-4">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-pill"
              placeholder="Enter your display name"
              value={name}
              onChange={handleNameChange}
              required
              minLength={2}
              maxLength={50}
              disabled={isSubmitting}
            />
            <div className="form-text">This name will be visible to others on your posts and comments</div>
          </div>

          {/* Email Field (read-only) */}
          <div className="mb-4">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control form-control-lg rounded-pill bg-light" 
              value={user.email} 
              disabled 
            />
            <div className="form-text">You cannot change your email address</div>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-end gap-3 mt-5">
            <button 
              type="button" 
              className="btn btn-outline-secondary rounded-pill px-4" 
              onClick={handleCancel} 
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn rounded-pill px-4 text-white"
              style={{ background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)', border: 'none' }}
              disabled={isSubmitting || !hasChanges}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;