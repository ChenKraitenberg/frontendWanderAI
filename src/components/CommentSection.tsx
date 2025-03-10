// src/components/CommentSection.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import postService from '../services/post_service';
import { PostComment } from '../types';
import { getImageUrl } from '../utils/imageUtils';
import { getUserDisplayName } from '../utils/userDisplayUtils';



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
  //const userId = localStorage.getItem('userId');

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const fetchedComments = await postService.getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await postService.addComment(postId, newComment);

      if (onCommentAdded) {
        onCommentAdded();
      }

      setNewComment('');
      await fetchComments(); // Refresh comments
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
            <img 
              src="/api/placeholder/40/40" 
              alt="Your avatar" 
              className="w-100 h-100 object-fit-cover" 
            />
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
              {isSubmitting ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-send-fill"></i>
              )}
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
            <div key={comment._id || index} className="d-flex gap-3 mb-4">
              <div
                className="rounded-circle overflow-hidden flex-shrink-0"
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                <img
                  src={comment.user.avatar ? getImageUrl(comment.user.avatar) : '/api/placeholder/40/40'}
                  alt={`${getUserDisplayName(comment.user)}'s avatar`}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>

              <div className="flex-grow-1">
                <div
                  className="p-3 rounded-4"
                  style={{
                    backgroundColor: '#f8f9fa',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">{getUserDisplayName(comment.user)}</span>
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
