// src/pages/profilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService, { User } from '../services/user_service';
import postService from '../services/post_service';
import wishlistService, { WishlistItem } from '../services/wishlist_service';
import MapComponent from '../components/MapComponent';
import Footer from '../components/shared/Footer';
import PostCard from '../components/PostCard';
import LogoutButton from '../components/LogoutButton';
import ProfileEdit from '../components/ProfileEdit';
import { Post } from '../types';
import ProfileImageUploader from '../components/ProfileImageUploader';
import { getUserDisplayName } from '../utils/userDisplayUtils';
import WishlistCard from '../components/WishlistCard';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'trips' | 'wishlist'>('trips');

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

  const fetchUserPosts = async (userId: string) => {
    try {
      console.log(`Fetching posts for user ID: ${userId}`);

      // Try the direct user ID endpoint first
      try {
        const userPosts = await postService.getByUserId(userId);
        console.log('Posts fetched by user ID:', userPosts);

        if (userPosts && userPosts.length > 0) {
          setPosts(userPosts);
          return;
        }
      } catch (error) {
        console.error('Error fetching posts by user ID:', error);
      }

      console.log('No posts found by user ID, trying alternative methods...');

      // Try owner field
      try {
        const ownerQueryParams = new URLSearchParams();
        ownerQueryParams.append('owner', userId);

        console.log('Fetching posts by owner param:', userId);
        const ownerResponse = await postService.getPosts(ownerQueryParams.toString());

        if (ownerResponse && ownerResponse.length > 0) {
          console.log('Posts fetched via owner param:', ownerResponse);
          setPosts(ownerResponse);
          return;
        }
      } catch (error) {
        console.error('Error fetching posts by owner:', error);
      }

      // Try userId field as query param
      try {
        const userIdQueryParams = new URLSearchParams();
        userIdQueryParams.append('userId', userId);

        console.log('Fetching posts by userId param:', userId);
        const userIdResponse = await postService.getPosts(userIdQueryParams.toString());

        if (userIdResponse && userIdResponse.length > 0) {
          console.log('Posts fetched via userId param:', userIdResponse);
          setPosts(userIdResponse);
          return;
        }
      } catch (error) {
        console.error('Error fetching posts by userId param:', error);
      }

      // If user has an email, try looking up posts by email
      if (user?.email) {
        try {
          console.log('Fetching all posts to filter by email...');
          const allPosts = await postService.getPosts();

          // Filter posts that might be associated with this user's email
          const userEmailLC = user.email.toLowerCase();
          const matchingPosts: Post[] = allPosts.filter((post: Post) => post.user?.email?.toLowerCase() === userEmailLC || post.userId === userId || post.userId === userId);

          if (matchingPosts.length > 0) {
            console.log('Posts matched by email filtering:', matchingPosts);
            setPosts(matchingPosts);
            return;
          }
        } catch (error) {
          console.error('Error during email filtering:', error);
        }
      }

      // If we still have no posts, set an empty array
      console.log('No posts found for user through any method');
      setPosts([]);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      setPosts([]);
    }
  };


  const fetchWishlistItems = () => {
    try {
      console.log('Fetching wishlist items from localStorage');
      const items = wishlistService.getWishlistItems();
      console.log('Wishlist items fetched:', items);
      setWishlistItems(items);
    } catch (error) {
      console.error('Failed to fetch wishlist items:', error);
      setWishlistItems([]);
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
  
        fetchWishlistItems();
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

  const handleRemoveFromWishlist = (itemId: string) => {
    setWishlistItems((current) => current.filter(item => item.id !== itemId));
  };

  const handleLikePost = async (postId: string, newLikes: string[]) => {
    try {
      // Update local state immediately for responsive UI
      setPosts((currentPosts) => currentPosts.map((post) => (post._id === postId ? { ...post, likes: newLikes } : post)));

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

        {/* Tabs for Trips/Wishlist */}
        <div className="mb-4">
          <ul className="nav nav-pills nav-fill">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'trips' ? 'active' : ''}`} 
                onClick={() => setActiveTab('trips')}
                style={{
                  background: activeTab === 'trips' ? 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)' : 'transparent',
                  color: activeTab === 'trips' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                }}>
                My Trips ({posts.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'wishlist' ? 'active' : ''}`} 
                onClick={() => setActiveTab('wishlist')}
                style={{
                  background: activeTab === 'wishlist' ? 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)' : 'transparent',
                  color: activeTab === 'wishlist' ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                }}>
                My Wishlist ({wishlistItems.length})
              </button>
            </li>
          </ul>
        </div>




        {/* Content based on active tab */}
        {activeTab === 'trips' ? (
          // My Trips Section
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
        ) : (
          // My Wishlist Section
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="h5 mb-0">My Wishlist</h3>
                <button
                  className="btn btn-outline-primary rounded-pill px-3"
                  onClick={() => navigate('/generate-trip')}
                  style={{
                    borderColor: '#4158D0',
                    color: '#4158D0',
                  }}>
                  <span className="me-2">✨</span>
                  Create More Ideas
                </button>
              </div>

              {wishlistItems.length > 0 ? (
                <div className="row g-4">
                  {wishlistItems.map((item) => (
                    <div key={`wishlist-${item.id}`} className="col-md-6 col-lg-4">
                      <WishlistCard
                        item={item}
                        onDelete={handleRemoveFromWishlist}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">Your wishlist is empty</p>
                  <p className="small text-muted">Generate a trip and save it to your wishlist!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
export default ProfilePage;
