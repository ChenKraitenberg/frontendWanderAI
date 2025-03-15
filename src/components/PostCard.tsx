import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { PostComment } from '../types';
import LikeButton from './LikeButton';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import postService from '../services/post_service';

interface Post {
  _id: string;
  title: string;
  description: string;
  image?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  price?: number;
  maxSeats?: number;
  bookedSeats?: number;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
  user?: {
    _id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
  likes: string[];
  comments: PostComment[];
  category?: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  name?: string;
  destination?: string;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string, newLikes: string[]) => void;
  onCommentClick: (postId: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
  onPostClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostClick, onLike, onCommentClick, onDelete, onEdit, showActions = true }) => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const userId = localStorage.getItem('userId');
  const isOwner = userId === post.userId;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postLikes, setPostLikes] = useState<string[]>(post.likes || []);
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());

  
  // Function to update current post with latest user info from localStorage
  const updatePostWithLatestUserInfo = useCallback(() => {
    if (post.userId === userId && post.user) {
      const storedName = localStorage.getItem('userName');
      const storedAvatar = localStorage.getItem('userAvatar');

      // Create a new post object with updated user info
      const updatedPost = {
        ...post,
        user: {
          ...post.user,
          name: storedName || post.user.name,
          avatar: storedAvatar || post.user.avatar,
        },
      };

      setCurrentPost(updatedPost);
    }
  }, [post, userId]);

  // Update post with latest user info on mount and when post changes
  useEffect(() => {
    updatePostWithLatestUserInfo();
  }, [post, updatePostWithLatestUserInfo]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log(`PostCard: Profile update detected for post ${post._id}`);
      updatePostWithLatestUserInfo();
      setRefreshTrigger(Date.now());
    };

    // Listen for custom events for profile updates
    window.addEventListener('user-avatar-updated', handleProfileUpdate);
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    window.addEventListener('user-info-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('user-avatar-updated', handleProfileUpdate);
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      window.removeEventListener('user-info-updated', handleProfileUpdate);
    };
  }, [updatePostWithLatestUserInfo, post._id]);

  // Fetch fresh post data on mount to ensure likes are up to date
  useEffect(() => {
    const refreshPostData = async () => {
      try {
        if (post && post._id) {
          const updatedPost = await postService.getPostById(post._id);
          if (updatedPost) {
            // Preserve local overrides for current user
            if (updatedPost.userId === userId && updatedPost.user) {
              const storedName = localStorage.getItem('userName');
              const storedAvatar = localStorage.getItem('userAvatar');

              if (storedName || storedAvatar) {
                updatedPost.user = {
                  ...updatedPost.user,
                  name: storedName || updatedPost.user.name,
                  avatar: storedAvatar || updatedPost.user.avatar,
                };
              }
            }

            setCurrentPost(updatedPost);
            setPostLikes(updatedPost.likes || []);
          }
        }
      } catch (error) {
        console.error('Failed to refresh post data:', error);
      }
    };

    refreshPostData();
  }, [post._id, post, refreshTrigger]);

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      console.log('Avatar update event received:', event.detail);
      setRefreshTrigger(Date.now());
    };

    window.addEventListener('user-avatar-updated', handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener('user-avatar-updated', handleAvatarUpdate as EventListener);
    };
  }, []);
  // Update local state when post prop changes
  useEffect(() => {
    setCurrentPost(post);
    setPostLikes(post.likes || []);
  }, [post]);

  // Format the date
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Format relative time for post creation
  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return `Posted on ${formatDate(date)}`;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/edit-post/${post._id}`);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (onDelete) {
        await onDelete();
      }
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLikeUpdate = (newLikes: string[]) => {
    console.log(`PostCard: handleLikeUpdate called with newLikes:`, newLikes);
    setPostLikes(newLikes);
    // Also update parent component if callback provided
    if (onLike && post._id) {
      console.log(`PostCard: calling onLike(${post._id}, newLikes)`);
      onLike(post._id, newLikes);
    } else {
      console.log(`PostCard: onLike not called - missing callback or post ID`);
      console.log(`   onLike exists: ${!!onLike}, post._id: ${post._id}`);
    }
  };

  // Get the user's avatar with cache busting
  const getUserAvatar = () => {
    // If the user is the current logged-in user, use potentially updated avatar from localStorage
    if (currentPost.user?._id === userId) {
      const storedAvatar = localStorage.getItem('userAvatar');
      if (storedAvatar) {
        // Don't add timestamp to data URLs
        if (storedAvatar.startsWith('data:')) {
          return storedAvatar;
        }
        return `${getImageUrl(storedAvatar)}?nocache=${refreshTrigger}`;
      }
    }

    // If user has an avatar, use it
    if (currentPost.user?.avatar) {
      // Don't add timestamp to data URLs
      if (currentPost.user.avatar.startsWith('data:')) {
        return currentPost.user.avatar;
      }
      return `${getImageUrl(currentPost.user.avatar)}?nocache=${refreshTrigger}`;
    }

    // Default avatar if nothing else is available
    return '/assets/default-avatar.png';
  };

  // Get user's display name, preferring localStorage for current user
  const getUserDisplayName = () => {
    // If it's the current user, check localStorage first for most up-to-date name
    if (currentPost.user?._id === userId) {
      const storedName = localStorage.getItem('userName');
      if (storedName) {
        return storedName;
      }
    }

    // Otherwise use what's in the post
    return currentPost.user?.name || currentPost.user?.email || 'Anonymous';
  };

  const displayTitle = currentPost.name || currentPost.title;

  const handleCommentClick = (postId: string) => {
  if (onCommentClick) {
    onCommentClick(postId);
  } else {
    navigate(`/post/${postId}`, { state: { showComments: true } });
  }
};

const handlePostClick = () => {
  if (onPostClick) {
    onPostClick(); 
  } else {
    const currentScrollPosition = window.scrollY;
    navigate(`/post/${post._id}`, { 
      state: { 
        from: location.pathname,
        scrollPosition: currentScrollPosition
      }
    });
  }
};

  return (
    <>
      <div className="card shadow rounded-4 border-0 h-100 post-card">
        {/* Post Image */}
        <img
          src={currentPost.image ? getImageUrl(currentPost.image) : '/assets/placeholder-image.jpg'}
          alt={currentPost.title}
          className="card-img-top rounded-top"
          style={{ objectFit: 'cover', height: '200px' }}
        />

        <div className="card-header bg-white border-0 d-flex align-items-center">
          <div className="user-avatar me-2">
            <img src={getUserAvatar()} alt={getUserDisplayName()} className="rounded-circle user-avatar-img" width="45" height="45" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{getUserDisplayName()}</h6>
            <small className="text-muted">{formatRelativeTime(currentPost.createdAt)}</small>
          </div>
          {/* Direct action buttons instead of dropdown */}
          {(isOwner || showActions) && (
            <div className="ms-auto">
              <button className="btn btn-outline-primary btn-sm me-2" onClick={handleEditClick} aria-label="Edit post">
                Edit
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={handleDeleteClick} aria-label="Delete post">
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div onClick={handlePostClick}>
        <div className="card-body">
        <h5 
            className="card-title fw-bold mb-2" 
            style={{ cursor: 'pointer' }} 
            onClick={handlePostClick}
          >
            {displayTitle}
          </h5>
          </div>

          {/* Destination display */}
          {currentPost.destination && (
            <div className="mb-2 ps-3">
              <small className="text-muted d-flex align-items-center">
                <i className="bi bi-geo-alt me-1"></i>
                {currentPost.destination}
              </small>
            </div>
          )}

          <p
            className="card-text text-muted mb-3 ps-3"
            style={{
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.5em',
              maxHeight: '4.5em',
            }}>
            {truncateText(currentPost.description, 120)}
          </p>

          {/* Trip Details */}
          {(currentPost.startDate || currentPost.price) && (
            <div className="d-flex flex-wrap gap-3 mb-3 ps-3">
              {currentPost.startDate && (
                <div className="small text-muted">
                  <i className="bi bi-calendar me-1"></i>
                  {formatDate(currentPost.startDate)}
                </div>
              )}
              {currentPost.price !== undefined && (
                <div className="small text-muted">
                  <i className="bi bi-cash me-1"></i>${currentPost.price}
                </div>
              )}
              {currentPost.maxSeats && (
                <div className="small text-muted">
                  <i className="bi bi-people me-1"></i>
                  {currentPost.maxSeats} seats
                </div>
              )}
            </div>
          )}

          {/* Category Badge */}
          {currentPost.category && (
            <div className="mb-3 ps-3">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  background:
                    currentPost.category === 'RELAXED'
                      ? 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)'
                      : currentPost.category === 'MODERATE'
                      ? 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)'
                      : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                }}>
                {currentPost.category}
              </span>
            </div>
          )}
        </div>

        {/* Interactions Footer */}
        <div className="card-footer bg-white border-top-0 d-flex justify-content-between">
          <LikeButton postId={post._id} initialLikes={postLikes} onLikeUpdated={handleLikeUpdate} />

          <button
            className="btn rounded-pill d-flex align-items-center gap-2"
            onClick={() => handleCommentClick(currentPost._id)}
            style={{
              border: '1px solid #dee2e6',
              background: 'white',
              color: '#6c757d',
              padding: '0.5rem 1rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.color = '#495057';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#6c757d';
            }}>
            <i className="bi bi-chat me-1"></i>
            {currentPost.comments.length} Comments
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
};

export default PostCard;
