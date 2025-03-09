// src/components/LikeButton.tsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import postService from '../services/post_service';
import { toast } from 'react-toastify';

interface LikeButtonProps {
  postId: string;
  initialLikes: string[];
  onLikeUpdated: (newLikes: string[]) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ postId, initialLikes, onLikeUpdated }) => {
  const [likes, setLikes] = useState<string[]>(initialLikes || []);
  const [isLiking, setIsLiking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

   // Get current user ID from localStorage
  const userId = localStorage.getItem('userId');
  const isLiked = userId ? likes.includes(userId) : false;

  useEffect(() => {
    console.log(`LikeButton mounted/updated for post ${postId}`);
    console.log(`Current userId: ${userId}`);
    console.log(`Initial likes:`, initialLikes);
    console.log(`Is post liked by current user: ${isLiked}`);
  }, [postId, initialLikes, userId, isLiked]);


  // Update likes when initialLikes change
  useEffect(() => {
    console.log(`initialLikes changed for post ${postId}:`, initialLikes);
    setLikes(initialLikes || []);
  }, [initialLikes, postId]);


  const handleLikeClick = async () => {
    if (isLiking || !userId){
      if (!userId) {
        toast.info('Please log in to like posts');
    }
      return;
    }

    try {
      setIsLiking(true);

      // Start animation when liking
      if (!isLiked) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }

        // Create optimistic update (clone the array to avoid mutation)
      const optimisticLikes = [...likes];
      
      if (isLiked) {
        // Remove like (filter out userId)
        const index = optimisticLikes.indexOf(userId);
        if (index > -1) {
          optimisticLikes.splice(index, 1);
        }
      } else {
        // Add like
        optimisticLikes.push(userId);
      }
      
      console.log(`Optimistic update - new likes:`, optimisticLikes);
      
      // First update local state for responsive UI
      setLikes(optimisticLikes);
      // Update parent component
      onLikeUpdated(optimisticLikes);

      // Call API to update like status on server
      console.log(`Calling likePost API for post ${postId}`);
      const response = await postService.likePost(postId);
      console.log(`API response for likePost:`, response);
      
      // Handle the server response
      if (response && response.likes) {
        console.log(`Server returned updated likes:`, response.likes);
        
        // Make sure the server response is used
        setLikes(response.likes);
        onLikeUpdated(response.likes);
      } else {
        console.warn("Unexpected server response format:", response);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      
      // Revert to initial state on error
      setLikes(initialLikes);
      onLikeUpdated(initialLikes);
      
      toast.error('Could not update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };


      /*// Update with actual server response
      if (response && Array.isArray(response.likes)) {
        setLikes(response.likes);
        onLikeUpdated(response.likes);
      } else if (response && typeof response.likes !== 'undefined'){
        // Handle different response formats
        setLikes(response.likes || optimisticLikes);
        onLikeUpdated(response.likes || optimisticLikes);
      }else{
        // If response is not what we expect, keep optimistic update
        onLikeUpdated(optimisticLikes);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      
      // Revert to initial state on error
      setLikes(initialLikes);
      toast.error('Could not update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };*/

  return (
    <button
      className="btn rounded-pill d-flex align-items-center gap-2"
      onClick={handleLikeClick}
      disabled={isLiking}
      aria-label={isLiked ? "Unlike post" : "Like post"}
      aria-pressed={isLiked}
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
        {isLiking ? '...' : `${likes.length} ${likes.length === 1 ? 'Like' : 'Likes'}`}
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
