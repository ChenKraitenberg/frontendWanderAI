// src/components/PostCard.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { PostComment } from '../types';

// Using the Post type that you have
interface Post {
  // _id: string;
  // title: string;
  // description: string;
  // image?: string;
  // likes: string[];
  // comments: any[];
  // createdAt: Date;
  // category?: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  // userId?: string;
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
  onDownload?: () => void;
  onEdit?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onBookmark?: () => void;
  onUnbookmark?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onCommentClick }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const isOwner = userId === post._id;

  // Format the date
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
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
          <img src="/api/placeholder/45/45" alt="User" className="rounded-circle" width="45" height="45" />
        </div>
        <div>
          <h6 className="mb-0 fw-bold">Travel Enthusiast</h6>
          <small className="text-muted">{formatDate(post.createdAt)}</small>
        </div>

        {isOwner && (
          <div className="ms-auto dropdown">
            <button className="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown">
              <span>⋮</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm">
              <li>
                <Link to={`/edit-post/${post._id}`} className="dropdown-item">
                  Edit
                </Link>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button className="dropdown-item text-danger">Delete</button>
              </li>
            </ul>
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
        <button className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center" onClick={onLike}>
          <span className="me-1" role="img" aria-label="like">
            ❤️
          </span>
          <span>{post.likes.length} Likes</span>
        </button>

        <button className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center" onClick={onCommentClick}>
          <span className="me-1" role="img" aria-label="comment">
            💬
          </span>
          <span>{post.comments.length} Comments</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
