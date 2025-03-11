// Enhanced ProfileEdit component to better handle updates
// src/components/ProfileEdit.tsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUploader from './ProfileImageUploader';
import { useAuth } from '../context/AuthContext';
import postService from '../services/post_service';

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar || null);
  const [hasChanges, setHasChanges] = useState(false);

  const { updateUserProfile } = useAuth();

  const handleProfileImageUpdate = (newImageUrl: string) => {
    setAvatarUrl(newImageUrl);
    setHasChanges(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setHasChanges(newName !== user.name);
  };

  // Comprehensive profile update handling
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

      // Only include fields that changed
      if (name !== user.name) {
        updatedData.name = name.trim();
      }

      if (avatarUrl !== user.avatar) {
        updatedData.avatar = avatarUrl || undefined;
      }

      // If we have no changes, just return
      if (Object.keys(updatedData).length === 0) {
        toast.info('No changes to save');
        onCancel();
        return;
      }

      // Step 1: Update the user profile
      await updateUserProfile(updatedData);

      // Step 2: Store updated values in localStorage for immediate access
      if (updatedData.name) {
        localStorage.setItem('userName', updatedData.name);
      }
      if (updatedData.avatar) {
        localStorage.setItem('userAvatar', updatedData.avatar);
        localStorage.setItem('userAvatarTimestamp', Date.now().toString());
      }

      // Step 3: Update posts and comments for comprehensive updates
      try {
        toast.info('Updating your content with new profile information...');

        const userId = user._id;
        const updateResults = await postService.updateUserInfoEverywhere(userId, updatedData);

        toast.success(`Profile updated! Changes applied to ${updateResults.posts} posts and comments in ${updateResults.comments} posts.`);

        // Force a refresh to ensure all content is updated
        await postService.forceRefreshUserContent(userId);
      } catch (updateError) {
        console.error('Error during content update:', updateError);
        toast.warning('Your profile was updated, but there was an issue updating some of your content.');
      }

      // Step 4: Notify parent component about the update
      onUpdate(updatedData);

      // Step 5: Trigger an event for real-time updates in other components
      window.dispatchEvent(
        new CustomEvent('user-profile-updated', {
          detail: {
            userId: user._id,
            updates: updatedData,
            timestamp: Date.now(),
          },
        })
      );
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg rounded-4">
      <div className="card-body p-4">
        <h3 className="h5 mb-4">Edit Profile</h3>

        <form onSubmit={handleSubmit}>
          {/* Profile Image */}
          <div className="text-center mb-4">
            <ProfileImageUploader currentImage={avatarUrl} onImageUpdate={handleProfileImageUpdate} userId={user._id} />
            <p className="text-muted small mt-2">Click on the image to change your profile picture</p>
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
            />
            <div className="form-text">This name will be visible to others on your posts and comments</div>
          </div>

          {/* Email Field (read-only) */}
          <div className="mb-4">
            <label className="form-label">Email</label>
            <input type="email" className="form-control form-control-lg rounded-pill bg-light" value={user.email} disabled />
            <div className="form-text">You cannot change your email address</div>
          </div>

          {/* Actions */}
          <div className="d-flex justify-content-end gap-3 mt-5">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCancel} disabled={isSubmitting}>
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
