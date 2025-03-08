// src/components/ProfileEdit.tsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ProfileImageUploader from './ProfileImageUploader';
import { useAuth } from '../context/AuthContext';

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

  const { updateUserProfile } = useAuth();

  const handleProfileImageUpdate = (newImageUrl: string) => {
    setAvatarUrl(newImageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const updatedData = {
        name: name.trim(),
      };

      // Use the updateUserProfile function from AuthContext
      await updateUserProfile(updatedData);

      // Notify parent component of changes
      onUpdate({
        name: name.trim(),
        avatar: avatarUrl || undefined,
      });

      toast.success('Profile updated successfully');
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
            <input type="text" className="form-control form-control-lg rounded-pill" placeholder="Enter your display name" value={name} onChange={(e) => setName(e.target.value)} />
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
            <button type="submit" className="btn rounded-pill px-4 text-white" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)', border: 'none' }} disabled={isSubmitting}>
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
