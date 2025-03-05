// src/components/LikeButton.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import tripService from '../services/post_service';

interface LikeButtonProps {
  postId: string;
  initialLikes: string[];
  onLikeUpdated: (newLikes: string[]) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLikes, onLikeUpdated }) => {
  const [likes, setLikes] = useState<string[]>(initialLikes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const userId = localStorage.getItem('userId');
  const isLiked = userId ? likes.includes(userId) : false;

  useEffect(() => {
    // Update likes if initialLikes changes
    setLikes(initialLikes || []);
  }, [initialLikes]);

  const handleLikeClick = async () => {
    if (isLiking || !userId) return;

    try {
      setIsLiking(true);

      // Start animation when liking
      if (!isLiked) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }

      const response = await tripService.likePost(postId);

      // Handle different response structures safely
      let updatedLikes: string[] = [];

      if (response && response.likes) {
        // Direct response structure (from doLike method)
        updatedLikes = response.likes;
      } else if (response && Array.isArray(response.likes)) {
        // Ensure response.likes is an array
        updatedLikes = response.likes;
      } else {
        // Fallback to current likes if response doesn't contain likes
        console.warn('Like response did not contain expected likes array:', response);
        updatedLikes = [...likes];

        // If toggle logic is happening server-side, simulate it client-side as fallback
        if (isLiked) {
          updatedLikes = updatedLikes.filter((id) => id !== userId);
        } else if (userId) {
          updatedLikes.push(userId);
        }
      }

      setLikes(updatedLikes);
      onLikeUpdated(updatedLikes);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Optionally implement optimistic UI updates here
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      className="btn rounded-pill d-flex align-items-center gap-2"
      onClick={handleLikeClick}
      disabled={isLiking}
      style={{
        border: 'none',
        background: isLiked ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        color: isLiked ? '#dc3545' : '#6c757d',
        padding: '0.5rem 1rem',
        transition: 'all 0.2s ease',
        transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isLiked ? 'rgba(220, 53, 69, 0.15)' : 'rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isLiked ? 'rgba(220, 53, 69, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      }}>
      <FontAwesomeIcon
        icon={isLiked ? solidHeart : regularHeart}
        className={isAnimating ? 'animate-heart' : ''}
        style={{
          transition: 'transform 0.3s ease',
          transform: isAnimating ? 'scale(1.2)' : 'scale(1)',
        }}
      />
      <span>
        {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
      </span>

      <style>{`
        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(1); }
          75% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-heart {
          animation: heartBeat 0.5s ease-in-out;
        }
      `}</style>
    </button>
  );
};

export default LikeButton;
