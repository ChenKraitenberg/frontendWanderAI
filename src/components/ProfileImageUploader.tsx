import React, { useState } from 'react';
import { toast } from 'react-toastify';
import userService from '../services/user_service';
import postService from '../services/post_service';
import { getImageUrl } from '../utils/imageUtils';

interface ProfileImageUploaderProps {
  currentImage?: string | null;
  onImageUpdate: (newImageUrl: string) => void;
  userId: string;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ currentImage, onImageUpdate, userId }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    let imageUrl = '';

    try {
      setUploading(true);
      toast.info('Uploading profile picture...');

      // Upload the image using the file upload service
      const uploadResponse = await userService.uploadProfileImage(file);
      imageUrl = uploadResponse.url;

      console.log('Successfully uploaded image:', imageUrl);

      // Store both in localStorage with timestamp for cache busting
      localStorage.setItem('userAvatar', imageUrl);
      localStorage.setItem('userAvatarTimestamp', Date.now().toString());

      // Make sure we have a valid user ID
      if (!userId) {
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
          throw new Error('User ID not found. Please log in again.');
        }
        userId = storedUserId;
      }

      // Update profile with new avatar
      await userService.updateProfile({
        avatar: imageUrl,
      });

      console.log('Profile updated with new avatar:', imageUrl);

      // Update UI immediately
      onImageUpdate(imageUrl);

      // Update all posts with the new avatar
      toast.info('Updating your posts and comments with new profile picture...');
      try {
        // Update all posts where the user is the owner
        const updatePostsResult = await postService.updatePostWithNewUserInfo(userId, {
          avatar: imageUrl,
        });

        // Update all comments by this user in any post
        const updateCommentsResult = await postService.updateUserInfoInAllComments(userId, {
          avatar: imageUrl,
        });

        console.log('Updated posts and comments with new avatar:', { posts: updatePostsResult, comments: updateCommentsResult });
        toast.success('Profile picture updated successfully');

        // Dispatch a custom event to notify components about the avatar update
        window.dispatchEvent(
          new CustomEvent('user-avatar-updated', {
            detail: {
              userId,
              avatar: imageUrl,
              timestamp: Date.now(),
            },
          })
        );
      } catch (postError) {
        console.error('Error updating posts/comments with new avatar:', postError);
        toast.warning('Profile picture updated but some posts/comments may not show the new image');
      }
    } catch (error) {
      console.error('Failed to update profile image:', error);
      toast.error('Error updating profile image');
    } finally {
      setUploading(false);
    }

    // Add a small timeout then reload the page to ensure everything is updated
    setTimeout(() => {
      window.location.reload();
    }, 2000);

    toast.success('Profile picture updated successfully! Refreshing page...');
  };

  // Get the display URL for the current image
  const displayImage = currentImage
    ? getImageUrl(currentImage)
    : localStorage.getItem('userAvatar')
    ? localStorage.getItem('userAvatar')
    : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e0e0e0"/%3E%3C/svg%3E';

  return (
    <div className="position-relative">
      <div
        className="rounded-4 shadow-lg border-4 border-white"
        style={{
          width: '120px',
          height: '120px',
          backgroundImage: `url(${displayImage}?t=${Date.now()})`,
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
