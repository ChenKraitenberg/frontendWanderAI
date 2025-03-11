// // src/components/ProfileImageUploader.tsx
// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import postService from '../services/post_service';

// interface ProfileImageUploaderProps {
//   currentImage?: string | null;
//   onImageUpdate: (newImageUrl: string) => void;
//   userId: string;
// }

// const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ currentImage, onImageUpdate, userId }) => {
//   const [uploading, setUploading] = useState(false);

//   // Add an effect to synchronize the displayed avatar with localStorage
//   useEffect(() => {
//     const storedAvatar = localStorage.getItem('userAvatar');
//     if (storedAvatar && (!currentImage || currentImage !== storedAvatar)) {
//       onImageUpdate(storedAvatar);
//     }
//   }, [currentImage, onImageUpdate]);

//   const resizeAndCompressImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const img = new Image();
//         img.onload = () => {
//           // Create a canvas to resize the image
//           const canvas = document.createElement('canvas');
//           let width = img.width;
//           let height = img.height;

//           // Calculate new dimensions
//           if (width > height) {
//             if (width > maxWidth) {
//               height = Math.round((height * maxWidth) / width);
//               width = maxWidth;
//             }
//           } else {
//             if (height > maxHeight) {
//               width = Math.round((width * maxHeight) / height);
//               height = maxHeight;
//             }
//           }

//           canvas.width = width;
//           canvas.height = height;

//           // Draw the resized image
//           const ctx = canvas.getContext('2d');
//           ctx?.drawImage(img, 0, 0, width, height);

//           // Convert to data URL with compression
//           const dataUrl = canvas.toDataURL('image/jpeg', quality);
//           resolve(dataUrl);
//         };
//         img.onerror = reject;
//         img.src = event.target?.result as string;
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files || e.target.files.length === 0) return;

//     const file = e.target.files[0];

//     try {
//       setUploading(true);

//       // Resize and compress the image before converting to data URL
//       const resizedDataUrl = await resizeAndCompressImage(file, 200, 200, 0.7);
//       console.log('Resized image to data URL');

//       // Store the avatar data URL in localStorage
//       localStorage.setItem('userAvatar', resizedDataUrl);

//       // Update the UI
//       onImageUpdate(resizedDataUrl);

//       // Update posts with the new avatar
//       try {
//         toast.info('Updating your posts with new profile picture...');

//         // Get the user ID
//         if (!userId) {
//           throw new Error('User ID not found');
//         }

//         // Use a workaround to update posts
//         const updatedCount = await postService.updateUserInfoInAllPosts(userId, {
//           avatar: resizedDataUrl,
//         });

//         console.log(`Updated ${updatedCount} posts with new avatar`);
//         toast.success(`Profile picture updated successfully in ${updatedCount} posts`);

//         localStorage.setItem('lastAvatarUpdateTime', Date.now().toString());
//       } catch (postsError) {
//         console.error('Error updating posts with new avatar:', postsError);
//         toast.warning('Your profile picture was updated, but there was an issue updating your posts');
//       }
//     } catch (error) {
//       console.error('Failed to update profile image:', error);
//       toast.error('Error updating profile image');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="position-relative">
//       <div
//         className="rounded-4 shadow-lg border-4 border-white"
//         style={{
//           width: '120px',
//           height: '120px',
//           backgroundImage: currentImage
//             ? `url(${currentImage})`
//             : localStorage.getItem('userAvatar')
//             ? `url(${localStorage.getItem('userAvatar')})`
//             : 'url(data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e0e0e0"/%3E%3C/svg%3E)',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           cursor: 'pointer',
//         }}
//         onClick={() => document.getElementById('profileImageInput')?.click()}>
//         {uploading && (
//           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 rounded-4">
//             <div className="spinner-border text-light" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}

//         <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2 shadow-sm" style={{ transform: 'translate(30%, 30%)' }}>
//           <span className="text-white">📷</span>
//         </div>
//       </div>

//       <input id="profileImageInput" type="file" accept="image/jpeg, image/png, image/gif" className="d-none" onChange={handleImageChange} />
//     </div>
//   );
// };

// export default ProfileImageUploader;
// src/components/ProfileImageUploader.tsx
// src/components/ProfileImageUploader.tsx
// src/components/ProfileImageUploader.tsx
// src/components/ProfileImageUploader.tsx
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

      // Add this in handleImageChange in ProfileImageUploader.tsx after successful upload
      // Store both in localStorage
      localStorage.setItem('userAvatar', imageUrl);
      localStorage.setItem('userAvatarTimestamp', Date.now().toString());

      // After updating all posts, manually trigger a refresh of key elements
      document.querySelectorAll('img.user-avatar-img').forEach((img) => {
        // Force image refresh by updating the src
        const imgElement = img as HTMLImageElement;
        if (imgElement.src && !imgElement.src.startsWith('data:')) {
          imgElement.src = `${imgElement.src.split('?')[0]}?t=${Date.now()}`;
        }
      });

      // As a last resort, refresh after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);

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

      // Store in localStorage for immediate use
      localStorage.setItem('userAvatar', imageUrl);

      // Update UI immediately
      onImageUpdate(imageUrl);

      // Update all posts with the new avatar
      toast.info('Updating your posts with new profile picture...');
      try {
        const updateResult = await postService.updateUserInfoInAllPosts(userId, {
          avatar: imageUrl,
        });

        console.log('Updated posts with new avatar:', updateResult);
        toast.success('Profile picture updated successfully');
      } catch (postError) {
        console.error('Error updating posts with new avatar:', postError);
        toast.warning('Profile picture updated but some posts may not show the new image');
      }
    } catch (error) {
      console.error('Failed to update profile image:', error);
      toast.error('Error updating profile image');
    } finally {
      setUploading(false);
    }

    window.dispatchEvent(
      new CustomEvent('avatar-updated', {
        detail: {
          userId,
          avatar: imageUrl,
          timestamp: Date.now(),
        },
      })
    );

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
          backgroundImage: `url(${displayImage})`,
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
