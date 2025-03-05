// src/components/CommentSection.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons';
import tripService from '../services/post_service';
import { getImageUrl } from '../utils/imageUtils';

interface Comment {
  _id: string;
  user: {
    _id: string;
    email: string;
    name?: string; // Added name property
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
  commentCount: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, initialComments = [], commentCount }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!showComments) return;

    try {
      setIsLoading(true);
      const response = await tripService.getComments(postId);
      setComments(response.data as unknown as Comment[]);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, postId]);

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await tripService.addComment(postId, newComment);
      setNewComment('');
      fetchComments(); // Refresh comments after adding new one
    } catch (error) {
      console.error('Failed to add comment:', error);
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
    <div className="mt-3">
      <button
        className="btn d-flex align-items-center gap-2"
        onClick={handleToggleComments}
        style={{
          padding: '0',
          background: 'transparent',
          color: '#6c757d',
          fontWeight: '600',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#495057')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6c757d')}>
        <FontAwesomeIcon icon={faComment} className="me-1" />
        {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
      </button>

      {showComments && (
        <div className="mt-3 pt-3 border-top">
          {isLoading ? (
            <div className="d-flex justify-content-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmitComment} className="mb-3">
                <div className="d-flex gap-2">
                  {/* User Avatar */}
                  <div
                    className="rounded-circle overflow-hidden flex-shrink-0"
                    style={{
                      width: '36px',
                      height: '36px',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}>
                    <img src="/api/placeholder/36/36" alt="Your avatar" className="w-100 h-100 object-fit-cover" />
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
                        paddingRight: '40px',
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
                      {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />}
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments list */}
              {comments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                <div
                  className="comment-list custom-scrollbar"
                  style={{
                    maxHeight: '350px',
                    overflowY: 'auto',
                    paddingRight: '5px',
                  }}>
                  {comments.map((comment) => (
                    <div key={comment._id} className="d-flex gap-2 mb-3">
                      <div
                        className="rounded-circle overflow-hidden flex-shrink-0"
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '2px solid #fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}>
                        <img
                          src={comment.user.avatar ? getImageUrl(comment.user.avatar) : '/api/placeholder/32/32'}
                          alt={`${comment.user.name || comment.user.email}'s avatar`}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>

                      <div className="flex-grow-1">
                        <div
                          className="p-2 rounded"
                          style={{
                            backgroundColor: '#f8f9fa',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          }}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold small">{comment.user.name || comment.user.email}</span>
                          </div>
                          <p className="mb-0 small">{comment.text}</p>
                        </div>
                        <div className="mt-1">
                          <small className="text-muted">{formatDate(comment.createdAt)}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
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
