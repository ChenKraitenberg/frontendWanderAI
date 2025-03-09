// src/pages/profilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService, { User } from '../services/user_service';
import postService from '../services/post_service';
import MapComponent from '../components/MapComponent';
import Footer from '../components/shared/Footer';
import PostCard from '../components/PostCard';
import LogoutButton from '../components/LogoutButton';
import ProfileEdit from '../components/ProfileEdit';
import { Post } from '../types';
import ProfileImageUploader from '../components/ProfileImageUploader';
import { getUserDisplayName } from '../utils/userDisplayUtils';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching user data...');

      const { request } = userService.getMe();
      const response = await request;
      const userData = response.data;

      // Check if userData has name property from API
      if (!userData.name) {
        // Try to get name from localStorage if not in API response
        const storedName = localStorage.getItem('userName');
        if (storedName) {
          userData.name = storedName;
        }
      }

      setUser(userData);
      console.log('User data fetched with name check:', userData);

      return userData;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      navigate('/login');
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  // Separate function to fetch posts
  const fetchUserPosts = async (userId: string) => {
    try {
      console.log(`Fetching posts for user ID: ${userId}`);
      const userPosts = await postService.getByUserId(userId);
      console.log('Posts fetched:', userPosts);
      setPosts(userPosts);
    } catch (error) {
      console.error('Failed to load trips:', error);
      setPosts([]);
    }
  };

  // Function to update profile image in local state
  const handleProfileImageUpdate = (newImageUrl: string) => {
    if (user) {
      setUser({
        ...user,
        avatar: newImageUrl,
      });
    }
  };

  // Function to handle profile updates
  const handleProfileUpdate = (updatedUser: { name?: string; avatar?: string }) => {
    if (user) {
      setUser({
        ...user,
        ...updatedUser,
      });
      setIsEditingProfile(false);
    }
  };

  // Use a single useEffect with the proper dependency
  useEffect(() => {
    const loadData = async () => {
      const userData = await fetchUserData();
      if (userData?._id) {
        await fetchUserPosts(userData._id);
      }
    };

    loadData();
  }, [fetchUserData]);

  const calculateTotalDays = () => {
    return posts.reduce((total, post) => {
      if (post.startDate && post.endDate) {
        const start = new Date(post.startDate);
        const end = new Date(post.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return total + Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      }
      return total;
    }, 0);
  };

  const handleEditPost = (postId: string) => {
    if (!postId) {
      console.error('Invalid post ID for editing');
      return;
    }
    console.log(`Navigating to edit post: ${postId}`);
    navigate(`/edit-post/${postId}`);
  };

  const handleDeletePost = async (postId: string) => {
    if (!postId) {
      console.error('Invalid post ID for deletion');
      return;
    }

    try {
      console.log(`Attempting to delete post with ID: ${postId}`);
      await postService.deletePost(postId);
      console.log('Post deleted successfully, updating state');
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error details when deleting post:', error);
      toast.error('Error deleting post');
    }
  };

  const handleLikePost = async (postId: string, newLikes: string[]) => {
    try {
      // Update local state immediately for responsive UI
      setPosts((currentPosts) => 
        currentPosts.map((post) => 
          post._id === postId 
            ? { ...post, likes: newLikes } 
            : post
        )
      );
      
      // Optionally: If you want to make sure everything is in sync with the server
      // you can fetch the complete list of user posts again
      if (user?._id) {
        const refreshedPosts = await postService.getByUserId(user._id);
        setPosts(refreshedPosts);
      }
    } catch (error) {
      console.error('Error handling post like:', error);
      toast.error('Something went wrong with the like operation');
    }
  };

  const handleCommentClick = (postId: string) => {
    if (!postId) {
      console.error('Invalid post ID for comment navigation');
      return;
    }
    navigate(`/post/${postId}`, { state: { showComments: true } });
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  console.log('Profile rendering with name:', getUserDisplayName(user));
  console.log('User object in profile:', user);

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Header Section */}
      <div
        className="position-relative"
        style={{
          background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)',
          borderRadius: '0 0 25px 25px',
          padding: '3rem 0 6rem',
        }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="position-relative">
                {user?._id ? (
                  <ProfileImageUploader currentImage={user.avatar || null} userId={user._id} onImageUpdate={handleProfileImageUpdate} />
                ) : (
                  <div
                    className="rounded-4 shadow-lg border-4 border-white"
                    style={{
                      width: '120px',
                      height: '120px',
                      backgroundImage: 'url(/api/placeholder/120/120)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}
              </div>
            </div>
            <div className="col text-white">
              {/* Use name instead of email when available */}
              <h1 className="display-6 fw-bold mb-2">{getUserDisplayName(user)}</h1>
              <div className="d-flex gap-4">
                <div>
                  <div className="fw-bold h4 mb-0">{posts.length}</div>
                  <small className="opacity-75">Trips Planned</small>
                </div>
                <div>
                  <div className="fw-bold h4 mb-0">{calculateTotalDays()}</div>
                  <small className="opacity-75">Travel Days</small>
                </div>
              </div>
            </div>
            <div className="col-auto d-flex gap-2">
              {!isEditingProfile && (
                <button className="btn btn-light rounded-pill px-4 py-2" onClick={() => setIsEditingProfile(true)}>
                  <i className="bi bi-pencil me-2"></i>
                  Edit Profile
                </button>
              )}
              <LogoutButton variant="outline" className="px-4 py-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex-grow-1" style={{ marginTop: '-3rem' }}>
        {isEditingProfile ? (
          // Profile Edit Form
          <div className="mb-4">
            {user && user._id && (
              <ProfileEdit user={user as { _id: string; email: string; name?: string; avatar?: string | null }} onUpdate={handleProfileUpdate} onCancel={() => setIsEditingProfile(false)} />
            )}
          </div>
        ) : (
          // Map Section
          <div className="card border-0 shadow-lg rounded-4 mb-4">
            <div className="card-body p-4">
              <h3 className="h5 mb-4">My Travel Map</h3>
              {user?._id && <MapComponent userId={user._id} />}
            </div>
          </div>
        )}

        {/* Trips Section */}
        <div className="card border-0 shadow-lg rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h5 mb-0">My Trips</h3>
              <button
                className="btn btn-outline-primary rounded-pill px-3"
                onClick={() => navigate('/generate-trip')}
                style={{
                  borderColor: '#4158D0',
                  color: '#4158D0',
                }}>
                <span className="me-2">✨</span>
                Generate New Trip
              </button>
            </div>

            {posts.length > 0 ? (
              <div className="row g-4">
                {posts.map((post) => (
                  <div key={`post-container-${post._id}`} className="col-md-6 col-lg-4">
                    <PostCard
                      key={`post-${post._id}`}
                      post={post}
                      onLike={handleLikePost}
                      onCommentClick={() => post._id && handleCommentClick(post._id)}
                      onEdit={() => post._id && handleEditPost(post._id)}
                      onDelete={() => post._id && handleDeletePost(post._id)}
                      showActions={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted mb-3">You haven't planned any trips yet</p>
                <p className="small text-muted">Click the button above to start planning!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
