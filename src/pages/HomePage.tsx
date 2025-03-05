// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import PostCard from '../components/PostCard';
import postService from '../services/post_service';
import { toast } from 'react-toastify';
import { PostComment } from '../types';

// Add this to your styling or in a separate CSS file
const styles = `
  .posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }
  
  .post-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .post-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  interface Post {
    _id: string;
    title: string;
    description: string;
    image?: string;
    startDate?: Date;
    endDate?: Date;
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

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await postService.getPosts();
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Could not load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      await postService.likePost(postId);
      // Refresh posts to update like count
      const updatedPosts = await postService.getPosts();
      setPosts(updatedPosts);
      toast.success('Post liked!');
    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Could not like post. Please try again.');
    }
  };

  const handleCommentClick = (postId: string) => {
    navigate(`/post/${postId}`, { state: { showComments: true } });
  };

  return (
    <MainLayout>
      <style>{styles}</style>
      <div className="container py-5">
        <h2 className="text-center mb-5 fw-bold">Recent Adventures</h2>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div
              className="spinner-border"
              style={{
                color: '#C850C0',
                width: '3rem',
                height: '3rem',
              }}
              role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : posts.length === 0 ? (
          <div className="text-center p-5 bg-light rounded-4 shadow-sm">
            <h3 className="text-muted mb-3">No adventures yet</h3>
            <p className="mb-4">Be the first to share your amazing travel experiences!</p>
            <button
              className="btn btn-lg text-white"
              style={{
                background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                border: 'none',
              }}
              onClick={() => navigate('/add-post')}>
              Create Post
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onLike={() => handleLike(post._id)} onCommentClick={() => handleCommentClick(post._id)} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HomePage;
