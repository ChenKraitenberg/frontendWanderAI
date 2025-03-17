// // src/components/CommentSection.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { toast } from 'react-toastify';
// import postService from '../services/post_service';
// import { PostComment } from '../types';
// import { getImageUrl } from '../utils/imageUtils';
// import { getUserDisplayName } from '../utils/userDisplayUtils';

// interface CommentSectionProps {
//   postId: string;
//   initialComments?: PostComment[];
//   commentCount: number;
//   onCommentAdded?: () => void;
// }

// const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialComments = [], commentCount, onCommentAdded }) => {
//   const [comments, setComments] = useState<PostComment[]>(initialComments);
//   const [newComment, setNewComment] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [avatarRefreshKey, setAvatarRefreshKey] = useState(Date.now()); // For forcing image refreshes
//   const userId = localStorage.getItem('userId');
//   const userAvatar = localStorage.getItem('userAvatar');
//   const userName = localStorage.getItem('userName');

//   // Reference to track if component is mounted
//   const isMounted = useRef(true);

//   // Set up cleanup when component unmounts
//   useEffect(() => {
//     return () => {
//       isMounted.current = false;
//     };
//   }, []);

//   // Initialize comments from props when they change
//   useEffect(() => {
//     if (initialComments.length > 0) {
//       setComments(initialComments);
//     } else {
//       // If no initial comments, fetch them
//       fetchComments();
//     }
//   }, [initialComments, postId]);

//   const fetchComments = async () => {
//     if (!postId) return;

//     try {
//       setIsLoading(true);
//       const fetchedComments = await postService.getComments(postId);

//       // Only update state if the component is still mounted
//       if (isMounted.current) {
//         setComments(fetchedComments);
//         console.log('Fetched comments:', fetchedComments);
//       }
//     } catch (error) {
//       console.error('Failed to fetch comments:', error);
//       if (isMounted.current) {
//         toast.error('Failed to load comments');
//       }
//     } finally {
//       if (isMounted.current) {
//         setIsLoading(false);
//       }
//     }
//   };

//   // Listen for avatar updates
//   useEffect(() => {
//     const handleAvatarUpdate = (event: CustomEvent) => {
//       console.log('CommentSection: Avatar update event received:', event.detail);

//       // Force refresh of avatar images
//       setAvatarRefreshKey(Date.now());

//       // Also refresh comments to get updated user data
//       fetchComments();
//     };

//     window.addEventListener('user-avatar-updated', handleAvatarUpdate as EventListener);

//     return () => {
//       window.removeEventListener('user-avatar-updated', handleAvatarUpdate as EventListener);
//     };
//   }, []);

//   // Effect to refresh avatar images
//   useEffect(() => {
//     // Update all user avatar images to use the latest avatar
//     const avatarImages = document.querySelectorAll('.user-avatar-img');
//     avatarImages.forEach((img) => {
//       const imgElement = img as HTMLImageElement;
//       if (imgElement.src && !imgElement.src.startsWith('data:')) {
//         const oldSrc = imgElement.src.split('?')[0]; // Remove any existing timestamp
//         imgElement.src = `${oldSrc}?t=${avatarRefreshKey}`;
//       }
//     });
//   }, [avatarRefreshKey, comments]);

//   const handleSubmitComment = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!newComment.trim() || isSubmitting) return;

//     try {
//       setIsSubmitting(true);
//       await postService.addComment(postId, newComment);

//       // Clear the input field
//       setNewComment('');

//       // Notify parent component
//       if (onCommentAdded) {
//         onCommentAdded();
//       }

//       // Refresh the comments list
//       await fetchComments();

//       // Force refresh of avatars
//       setAvatarRefreshKey(Date.now());

//       toast.success('Comment added successfully');
//     } catch (error) {
//       console.error('Failed to add comment:', error);
//       toast.error('Failed to add comment');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Format date
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffTime = Math.abs(now.getTime() - date.getTime());
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//     const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
//     const diffMinutes = Math.floor(diffTime / (1000 * 60));

//     if (diffMinutes < 1) {
//       return 'Just now';
//     } else if (diffMinutes < 60) {
//       return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
//     } else if (diffHours < 24) {
//       return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
//     } else if (diffDays === 1) {
//       return 'Yesterday';
//     } else if (diffDays < 7) {
//       return `${diffDays} days ago`;
//     } else {
//       return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
//     }
//   };

//   // Get current user avatar URL with cache busting
//   const getCurrentUserAvatarUrl = () => {
//     if (!userAvatar) return '/api/placeholder/40/40';

//     // If it's a data URL, return as is
//     if (userAvatar.startsWith('data:')) return userAvatar;

//     // Add cache busting parameter
//     return `${getImageUrl(userAvatar)}?t=${avatarRefreshKey}`;
//   };

//   // Get comment author avatar URL with cache busting
//   const getCommentAuthorAvatarUrl = (comment: PostComment) => {
//     // Check if it's the current user
//     if (comment.user._id === userId && userAvatar) {
//       // If current user, use the latest avatar from localStorage
//       return getCurrentUserAvatarUrl();
//     }

//     // Otherwise use the avatar from the comment
//     if (!comment.user.avatar) return '/api/placeholder/40/40';

//     // If it's a data URL, return as is
//     if (comment.user.avatar.startsWith('data:')) return comment.user.avatar;

//     // Add cache busting parameter
//     return `${getImageUrl(comment.user.avatar)}?t=${avatarRefreshKey}`;
//   };

//   // Get comment author name
//   const getCommentAuthorName = (comment: PostComment) => {
//     // Check if it's the current user
//     if (comment.user._id === userId && userName) {
//       // If current user, use the latest name from localStorage
//       return userName;
//     }

//     // Otherwise use the name from the comment
//     return getUserDisplayName(comment.user);
//   };

//   return (
//     <div className="comment-section">
//       <h5 className="mb-4">Comments ({commentCount})</h5>

//       {/* Comment Form */}
//       <form onSubmit={handleSubmitComment} className="mb-4">
//         <div className="d-flex gap-3">
//           {/* User Avatar */}
//           <div
//             className="rounded-circle overflow-hidden flex-shrink-0"
//             style={{
//               width: '40px',
//               height: '40px',
//               border: '2px solid #fff',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//             }}>
//             <img src={getCurrentUserAvatarUrl()} alt="Your avatar" className="w-100 h-100 object-fit-cover user-avatar-img" />
//           </div>

//           {/* Input field */}
//           <div className="position-relative flex-grow-1">
//             <input
//               type="text"
//               className="form-control rounded-pill bg-light border-0"
//               placeholder="Add a comment..."
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               disabled={isSubmitting}
//               style={{
//                 paddingRight: '50px',
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
//               }}
//             />
//             <button
//               type="submit"
//               className="btn position-absolute"
//               style={{
//                 right: '8px',
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 color: newComment.trim() ? '#0d6efd' : '#6c757d',
//                 opacity: newComment.trim() ? '1' : '0.5',
//                 padding: '0.25rem',
//                 background: 'transparent',
//                 transition: 'color 0.2s ease',
//               }}
//               disabled={isSubmitting || !newComment.trim()}>
//               {isSubmitting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="bi bi-send-fill"></i>}
//             </button>
//           </div>
//         </div>
//       </form>

//       {/* Comments list */}
//       {isLoading ? (
//         <div className="d-flex justify-content-center py-4">
//           <div className="spinner-border text-primary" role="status">
//             <span className="visually-hidden">Loading comments...</span>
//           </div>
//         </div>
//       ) : comments.length === 0 ? (
//         <div className="text-center py-4">
//           <p className="text-muted mb-0">No comments yet. Be the first to comment!</p>
//         </div>
//       ) : (
//         <div
//           className="comment-list custom-scrollbar"
//           style={{
//             maxHeight: '500px',
//             overflowY: 'auto',
//             paddingRight: '5px',
//           }}>
//           {comments.map((comment, index) => (
//             <div key={comment._id || `comment-${index}-${avatarRefreshKey}`} className="d-flex gap-3 mb-4">
//               <div
//                 className="rounded-circle overflow-hidden flex-shrink-0"
//                 style={{
//                   width: '40px',
//                   height: '40px',
//                   border: '2px solid #fff',
//                   boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
//                 }}>
//                 <img src={getCommentAuthorAvatarUrl(comment)} alt={`${getCommentAuthorName(comment)}'s avatar`} className="w-100 h-100 object-fit-cover user-avatar-img" />
//               </div>

//               <div className="flex-grow-1">
//                 <div
//                   className="p-3 rounded-4"
//                   style={{
//                     backgroundColor: '#f8f9fa',
//                     boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
//                   }}>
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <span className="fw-semibold">{getCommentAuthorName(comment)}</span>
//                     <small className="text-muted">{formatDate(comment.createdAt.toString())}</small>
//                   </div>
//                   <p className="mb-0">{comment.text}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 4px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #c1c1c1;
//           border-radius: 10px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #a8a8a8;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CommentSection;
// src/components/CommentSection.tsx - Fix for loading screen in empty comments
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import postService from '../services/post_service';
import { PostComment } from '../types';
import { getImageUrl } from '../utils/imageUtils';
//import { getUserDisplayName } from '../utils/userDisplayUtils';

interface CommentSectionProps {
  postId: string;
  initialComments?: PostComment[];
  commentCount: number;
  onCommentAdded?: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialComments = [], commentCount, onCommentAdded }) => {
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(Date.now());
  const userId = localStorage.getItem('userId');
  const userAvatar = localStorage.getItem('userAvatar');
  const userName = localStorage.getItem('userName');

  // Reference to track if component is mounted
  const isMounted = useRef(true);

  // Set up cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize comments from props immediately - don't fetch if we already have data
  useEffect(() => {
    // Always set the comments from props
    setComments(initialComments);

    // Only fetch comments from server if specifically needed
    // - Don't fetch if we already have comments from props
    // - Don't fetch if the comment count is 0 (avoids showing loading for empty comments)
    if (initialComments.length === 0 && commentCount > 0) {
      fetchComments();
    }
  }, [initialComments, commentCount, postId]);

  const fetchComments = async () => {
    if (!postId) return;

    try {
      setIsLoading(true);
      const fetchedComments = await postService.getComments(postId);

      // Only update state if the component is still mounted
      if (isMounted.current) {
        setComments(fetchedComments);
        console.log('Fetched comments:', fetchedComments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      if (isMounted.current) {
        toast.error('Failed to load comments');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Listen for avatar updates
  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      console.log('CommentSection: Avatar update event received:', event.detail);

      // Force refresh of avatar images
      setAvatarRefreshKey(Date.now());

      // Only refresh comments from server if we have any
      if (commentCount > 0) {
        fetchComments();
      }
    };

    window.addEventListener('user-avatar-updated', handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener('user-avatar-updated', handleAvatarUpdate as EventListener);
    };
  }, [commentCount]);

  // Effect to refresh avatar images
  useEffect(() => {
    // Update all user avatar images to use the latest avatar
    const avatarImages = document.querySelectorAll('.user-avatar-img');
    avatarImages.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      if (imgElement.src && !imgElement.src.startsWith('data:')) {
        const oldSrc = imgElement.src.split('?')[0]; // Remove any existing timestamp
        imgElement.src = `${oldSrc}?t=${avatarRefreshKey}`;
      }
    });
  }, [avatarRefreshKey, comments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await postService.addComment(postId, newComment);

      // Clear the input field
      setNewComment('');

      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded();
      }

      // Refresh the comments list
      await fetchComments();

      // Force refresh of avatars
      setAvatarRefreshKey(Date.now());

      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    }
  };

  // Get current user avatar URL with cache busting
  const getCurrentUserAvatarUrl = () => {
    if (!userAvatar) return '/api/placeholder/40/40';

    // If it's a data URL, return as is
    if (userAvatar.startsWith('data:')) return userAvatar;

    // Add cache busting parameter
    return `${getImageUrl(userAvatar)}?t=${avatarRefreshKey}`;
  };

  // Get comment author avatar URL with cache busting
  const getCommentAuthorAvatarUrl = (comment: PostComment) => {
    // Check if it's the current user
    if (comment.user._id === userId) {
      // If current user, use the latest avatar from localStorage
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) {
        // Don't add timestamp to data URLs
        if (storedAvatar.startsWith('data:')) {
          return storedAvatar;
        }
        return `${getImageUrl(storedAvatar)}?t=${avatarRefreshKey}`;
      }
    }
  
    // Otherwise use the avatar from the comment
    if (!comment.user.avatar) return '/api/placeholder/40/40';
  
    // Don't add timestamp to data URLs
    if (comment.user.avatar.startsWith('data:')) {
      return comment.user.avatar;
    }
    return `${getImageUrl(comment.user.avatar)}?t=${avatarRefreshKey}`;
  };

  // Get comment author name
  const getCommentAuthorName = (comment: PostComment) => {
    // Check if it's the current user
    if (comment.user._id === userId && userName) {
      // If current user, use the latest name from localStorage
      return userName;
    }
  
    // Otherwise use the name from the comment
    return comment.user.name || comment.user.email || 'Anonymous';
  };

  return (
    <div className="comment-section">
      <h5 className="mb-4">Comments ({commentCount})</h5>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-4">
        <div className="d-flex gap-3">
          {/* User Avatar */}
          <div
            className="rounded-circle overflow-hidden flex-shrink-0"
            style={{
              width: '40px',
              height: '40px',
              border: '2px solid #fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}>
            <img src={getCurrentUserAvatarUrl()} alt="Your avatar" className="w-100 h-100 object-fit-cover user-avatar-img" />
          </div>

          {/* Input field */}
          <div className="position-relative flex-grow-1">
            <input
              type="text"
              className="form-control rounded-pill bg-light border-0"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
              style={{
                paddingRight: '50px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            />
            <button
              type="submit"
              className="btn position-absolute"
              style={{
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: newComment.trim() ? '#0d6efd' : '#6c757d',
                opacity: newComment.trim() ? '1' : '0.5',
                padding: '0.25rem',
                background: 'transparent',
                transition: 'color 0.2s ease',
              }}
              disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <i className="bi bi-send-fill"></i>}
            </button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="d-flex justify-content-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading comments...</span>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted mb-0">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div
          className="comment-list custom-scrollbar"
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
            paddingRight: '5px',
          }}>
          {comments.map((comment, index) => (
            <div key={comment._id || `comment-${index}-${avatarRefreshKey}`} className="d-flex gap-3 mb-4">
              <div
                className="rounded-circle overflow-hidden flex-shrink-0"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                <img src={getCommentAuthorAvatarUrl(comment)} alt={`${getCommentAuthorName(comment)}'s avatar`} className="w-100 h-100 object-fit-cover user-avatar-img" />
              </div>

              <div className="flex-grow-1">
                <div
                  className="p-3 rounded-4"
                  style={{
                    backgroundColor: '#f8f9fa',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">{getCommentAuthorName(comment)}</span>
                    <small className="text-muted">{formatDate(comment.createdAt.toString())}</small>
                  </div>
                  <p className="mb-0">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default CommentSection;
