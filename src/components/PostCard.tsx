// src/components/PostCard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string, newLikes: string[]) => void;
  onCommentClick: (postId: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onCommentClick, onDelete, onEdit, showActions = true }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const isOwner = userId === post.userId;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postLikes, setPostLikes] = useState<string[]>(post.likes || []);
  const [currentPost, setCurrentPost] = useState<Post>(post);

// Fetch fresh post data on mount to ensure likes are up to date
useEffect(() => {
  const refreshPostData = async () => {
    try {
      if (post && post._id) {
        const updatedPost = await postService.getPostById(post._id);
        if (updatedPost) {
          setCurrentPost(updatedPost);
          setPostLikes(updatedPost.likes || []);
        }
      }
    } catch (error) {
      console.error('Failed to refresh post data:', error);
    }
  };

  refreshPostData();
}, [post._id, post]);

// Update local state when post prop changes
useEffect(() => {
  setCurrentPost(post);
  setPostLikes(post.likes || []);
}, [post]);


  // Format the date
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`;
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

  /*const handleCommentClick = (postId: string) => {
    navigate(`/post/${postId}`, { state: { showComments: true } });
  };*/


  return (
    <>
      <div className="card shadow rounded-4 border-0 h-100 post-card">
        {/* Post Image */}
        <div
          className="card-img-top"
          style={{
            height: '180px',
            backgroundImage: currentPost.image ? `url(${getImageUrl(currentPost.image)})` : 'url(/api/placeholder/800/400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/post/${currentPost._id}`)}
        />

        {/* User Info Header */}
        <div className="card-header bg-white border-0 d-flex align-items-center">
          <div className="user-avatar me-2">
            <img 
              src={currentPost.user?.avatar ? getImageUrl(currentPost.user.avatar) : '/api/placeholder/45/45'} 
              alt={currentPost.user?.name || 'User'} 
              className="rounded-circle" 
              width="45" 
              height="45" 
            />
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{currentPost.user?.name || currentPost.user?.email || 'Anonymous'}</h6>
            <small className="text-muted">{formatDate(currentPost.createdAt)}</small>
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
        <div className="card-body">
          <h5 
            className="card-title fw-bold mb-2" 
            style={{ cursor: 'pointer' }} 
            onClick={() => navigate(`/post/${currentPost._id}`)}
          >
            {currentPost.title}
          </h5>
          <p
            className="card-text text-muted mb-3"
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
            <div className="d-flex flex-wrap gap-3 mb-3">
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
            <div className="mb-3">
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
          <LikeButton 
            postId={post._id} 
            initialLikes={postLikes} 
            onLikeUpdated={handleLikeUpdate} 
          />

        <button 
          className="btn rounded-pill d-flex align-items-center gap-2"
          onClick={() => onCommentClick(currentPost._id)} 
          style={{
            border: '1px solid #dee2e6',
            background: 'white',
            color: '#6c757d',
            padding: '0.5rem 1rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8f9fa';
            e.currentTarget.style.color = '#495057';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#6c757d';
          }}
        >
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
