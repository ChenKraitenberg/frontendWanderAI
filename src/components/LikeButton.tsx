// src/components/LikeButton.tsx
import React, { useState } from 'react';
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
  const [likes, setLikes] = useState<string[]>(initialLikes);
  const [isLiking, setIsLiking] = useState(false);

  const userId = localStorage.getItem('userId');
  const isLiked = userId ? likes.includes(userId) : false;

  const handleLikeClick = async () => {
    if (isLiking || !userId) return;

    try {
      setIsLiking(true);
      const response = await tripService.likePost(postId);
      const updatedLikes = response.data.likes;
      setLikes(updatedLikes);
      onLikeUpdated(updatedLikes);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <button
      className="btn btn-sm rounded-pill"
      onClick={handleLikeClick}
      disabled={isLiking}
      style={{
        background: isLiked ? 'rgba(200,80,192,0.1)' : 'transparent',
        border: '1px solid #dee2e6',
        color: isLiked ? '#C850C0' : '#6c757d',
      }}>
      <FontAwesomeIcon icon={isLiked ? solidHeart : regularHeart} className="me-2" />
      {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
    </button>
  );
};

export default LikeButton;
