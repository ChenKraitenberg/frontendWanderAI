// src/components/PostCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { PostComment } from '../types';
import LikeButton from './LikeButton';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

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
    avatar?: string;
  };
  likes: string[];
  comments: PostComment[];
  category?: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onCommentClick: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onCommentClick,
  onDelete,
  onEdit,
  showActions = true, // Changed default to true
}) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const isOwner = userId === post.userId;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    console.log('Likes updated:', newLikes);
    onLike();
  };

  return (
    <>
      <div className="card shadow rounded-4 border-0 h-100 post-card">
        {/* Post Image */}
        <div
          className="card-img-top"
          style={{
            height: '180px',
            backgroundImage: post.image ? `url(${getImageUrl(post.image)})` : 'url(/api/placeholder/800/400)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/post/${post._id}`)}
        />

        {/* User Info Header */}
        <div className="card-header bg-white border-0 d-flex align-items-center">
          <div className="user-avatar me-2">
            <img src={post.user?.avatar ? getImageUrl(post.user.avatar) : '/api/placeholder/45/45'} alt="User" className="rounded-circle" width="45" height="45" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold">{post.user?.email || 'Travel Enthusiast'}</h6>
            <small className="text-muted">{formatDate(post.createdAt)}</small>
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
          <h5 className="card-title fw-bold mb-2" style={{ cursor: 'pointer' }} onClick={() => navigate(`/post/${post._id}`)}>
            {post.title}
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
            {truncateText(post.description, 120)}
          </p>

          {/* Trip Details */}
          {(post.startDate || post.price) && (
            <div className="d-flex flex-wrap gap-3 mb-3">
              {post.startDate && (
                <div className="small text-muted">
                  <i className="bi bi-calendar me-1"></i>
                  {formatDate(post.startDate)}
                </div>
              )}
              {post.price !== undefined && (
                <div className="small text-muted">
                  <i className="bi bi-cash me-1"></i>${post.price}
                </div>
              )}
              {post.maxSeats && (
                <div className="small text-muted">
                  <i className="bi bi-people me-1"></i>
                  {post.maxSeats} seats
                </div>
              )}
            </div>
          )}

          {/* Category Badge */}
          {post.category && (
            <div className="mb-3">
              <span
                className="badge rounded-pill px-3 py-2"
                style={{
                  background:
                    post.category === 'RELAXED'
                      ? 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)'
                      : post.category === 'MODERATE'
                      ? 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)'
                      : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                }}>
                {post.category}
              </span>
            </div>
          )}
        </div>

        {/* Interactions Footer */}
        <div className="card-footer bg-white border-top-0 d-flex justify-content-between">
          <LikeButton postId={post._id} initialLikes={post.likes} onLikeUpdated={handleLikeUpdate} />

          <button className="btn btn-sm rounded-pill" onClick={onCommentClick} style={{ border: '1px solid #dee2e6' }}>
            <span className="me-2">💬</span>
            <span>{post.comments.length} Comments</span>
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
