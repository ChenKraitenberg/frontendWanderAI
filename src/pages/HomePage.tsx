// (HomePage.tsx)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import PostCard from '../components/PostCard';
import postService from '../services/post_service';
import { toast } from 'react-toastify';
import { PostComment } from '../types';

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
      name?: string;
      avatar?: string;
    };
    likes: string[];
    comments: PostComment[];
    category?: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const userId = localStorage.getItem('userId');

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

  const handleLike = async (postId: string, newLikes: string[]) => {
    if (!postId) {
      console.error('Invalid post ID for like operation');
      return;
    }
  
    try {
      console.log(`HomePage: Handling like for post ${postId}, new likes:`, newLikes);
      
      // Update local state immediately for responsive UI
      setPosts((currentPosts) => {
        console.log(`HomePage: Updating posts state for like on ${postId}`);
        return currentPosts.map((post) => {
          if (post._id === postId) {
            console.log(`HomePage: Updating post ${postId} with new likes:`, newLikes);
            return { ...post, likes: newLikes };
          }
          return post;
        });
      });
      
      // No need to call the API again - LikeButton already did that
      // But we can refresh the data after a delay to ensure consistency
      setTimeout(async () => {
        try {
          console.log(`HomePage: Refreshing posts data to ensure like state is consistent`);
          const freshPosts = await postService.getPosts();
          console.log(`HomePage: Got fresh posts data:`, freshPosts);
          setPosts(freshPosts);
        } catch (err) {
          console.error('Error refreshing posts data:', err);
        }
      }, 2000); // 2 second delay
      
    } catch (error) {
      console.error('Error handling post like in HomePage:', error);
      toast.error('Something went wrong with the like operation');
    }
  };


  const handleCommentClick = (postId: string) => {
    navigate(`/post/${postId}`, { state: { showComments: true } });
  };

  // הוספת פונקציית מחיקה לדף הבית
  const handleDeletePost = async (postId: string) => {
    // מניעת לחיצות כפולות
    if (isDeletingPost || !postId) {
      return;
    }

    // בדיקה שרק הבעלים של הפוסט יכול למחוק אותו
    const post = posts.find((p) => p._id === postId);
    if (!post || post.userId !== userId) {
      toast.error('אין לך הרשאה למחוק פוסט זה');
      return;
    }

    try {
      setIsDeletingPost(true);
      console.log(`Attempting to delete post with ID: ${postId}`);
      await postService.deletePost(postId);
      console.log('Post deleted successfully, updating state');
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
      toast.success('הפוסט נמחק בהצלחה');
    } catch (error) {
      console.error('Error details when deleting post:', error);
      toast.error('שגיאה במחיקת הפוסט');
    } finally {
      setIsDeletingPost(false);
    }
  };

  // הוספת פונקציית עריכה
  const handleEditPost = (postId: string) => {
    // בדיקה שרק הבעלים של הפוסט יכול לערוך אותו
    const post = posts.find((p) => p._id === postId);
    if (!post || post.userId !== userId) {
      toast.error('אין לך הרשאה לערוך פוסט זה');
      return;
    }

    navigate(`/edit-post/${postId}`);
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
            {posts.map((post, index) => (
              <PostCard
                key={`post-${post._id}-${index}`}
                post={post}
                onLike={handleLike}
                onCommentClick={() => handleCommentClick(post._id)}
                onEdit={() => handleEditPost(post._id)}
                onDelete={() => handleDeletePost(post._id)}
                showActions={post.userId === userId}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HomePage;

// נשאר ללא שינוי
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
