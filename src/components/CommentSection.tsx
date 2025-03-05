// src/components/CommentSection.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import tripService from '../services/post_service';

interface Comment {
  _id: string;
  user: {
    _id: string;
    email: string;
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

  return (
    <div className="comment-section mt-2">
      <button className="btn btn-sm rounded-pill me-2" onClick={handleToggleComments} style={{ border: '1px solid #dee2e6' }}>
        <FontAwesomeIcon icon={faComment} className="me-2" />
        {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
      </button>

      {showComments && (
        <div className="comments-container mt-3">
          {isLoading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <p className="text-muted text-center small">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="comment-list">
                  {comments.map((comment) => (
                    <div key={comment._id} className="comment d-flex mb-3">
                      <div
                        className="avatar me-2 rounded-circle bg-light"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundImage: comment.user.avatar ? `url(${comment.user.avatar})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {!comment.user.avatar && <span className="text-muted">{comment.user.email.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div className="comment-content bg-light p-2 rounded flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold small">{comment.user.email}</span>
                          <small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small>
                        </div>
                        <p className="mb-0 small">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmitComment} className="mt-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-start"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button type="submit" className="btn btn-sm btn-primary" disabled={isSubmitting || !newComment.trim()}>
                    {isSubmitting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <FontAwesomeIcon icon={faPaperPlane} />}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
