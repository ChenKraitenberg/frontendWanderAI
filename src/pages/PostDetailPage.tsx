import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import postService from '../services/post_service';
import MainLayout from '../components/layouts/MainLayout';
import LikeButton from '../components/LikeButton';
import CommentSection from '../components/CommentSection';
import { Post } from '../types';
import { getImageUrl } from '../utils/imageUtils';
//import { getUserDisplayName } from '../utils/userDisplayUtils';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(Date.now()); // Used to force re-renders of images
  const userId = localStorage.getItem('userId');
  const isOwner = userId && post?.userId === userId;
  const [commentCount, setCommentCount] = useState<number>(0);

  // Check if showComments state was passed through location
  useEffect(() => {
    console.log('Location state:', location.state);
    if (location.state && 'showComments' in location.state) {
      console.log('Setting showComments to:', location.state.showComments);
      setShowComments(location.state.showComments === true);
    }
  }, [location.state]);

  // Function to fetch post data - extracted for reuse
  const fetchPostData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      console.log(`Fetching post with ID: ${id}`);
      const fetchedPost = await postService.getPostById(id);
      console.log('Fetched post details:', fetchedPost);
      setPost(fetchedPost);
      setCommentCount(fetchedPost.comments?.length || 0);
      return fetchedPost;
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setError('Failed to load post. Please try again later.');
      toast.error('Failed to load post');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial post fetch
  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Profile update event received in PostDetailPage:', customEvent.detail);

      // Force re-render by updating the timestamp
      setForceRefresh(Date.now());

      // Also refresh the post data
      await fetchPostData();
    };

    // Add event listener for profile updates
    window.addEventListener('user-avatar-updated', handleProfileUpdate);

    // Clean up
    return () => {
      window.removeEventListener('user-avatar-updated', handleProfileUpdate);
    };
  }, [fetchPostData]);

  // Force image refreshes when the component mounts or refreshTrigger changes
  useEffect(() => {
    // Function to update all user avatars in the page
    const updateUserAvatars = () => {
      document.querySelectorAll('img.user-avatar-img').forEach((img) => {
        const imgElement = img as HTMLImageElement;
        if (imgElement.src && !imgElement.src.startsWith('data:')) {
          // Add timestamp parameter to force refresh
          const timestamp = Date.now();
          imgElement.src = `${imgElement.src.split('?')[0]}?t=${timestamp}`;
        }
      });
    };

    // Call it once on component mount and whenever the trigger changes
    updateUserAvatars();
  }, [forceRefresh, showComments]);

  useEffect(() => {
    if (window.history.state && window.history.state.scrollPosition) {
      window.scrollTo(0, window.history.state.scrollPosition);
    }
  }, []);

  // Handle new comment added
  const handleCommentAdded = useCallback(() => {
    setCommentCount((prevCount) => prevCount + 1);

    // Refresh the post to get updated comment data
    fetchPostData();

    // Also force re-render of images
    setForceRefresh(Date.now());
  }, [fetchPostData]);

  const handleLikeUpdate = async (newLikes: string[]) => {
    if (!post) return;

    try {
      setPost({
        ...post,
        likes: newLikes,
      });
    } catch (error) {
      console.error('Error updating likes:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleEditPost = () => {
    if (!post || !post._id) return;
    navigate(`/edit-post/${post._id}`);
  };

  const handleDeletePost = async () => {
    if (!post || !post._id) return;

    try {
      await postService.deletePost(post._id);
      toast.success('Post deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.toLocaleString('default', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const calculateDuration = (startDate?: Date | string, endDate?: Date | string) => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Get the display title - prefer name field if available, fallback to title
  const getDisplayTitle = () => {
    if (!post) return '';
    return post.title;
  };


// Get user's avatar with cache busting
const getUserAvatar = () => {
  if (!post) return '';
  // ONLY apply localStorage data if this post belongs to the current user
  if (post.userId === userId && post.user) {
    const storedAvatar = localStorage.getItem('userAvatar');
    if (storedAvatar) {
      return storedAvatar.startsWith('data:') 
        ? storedAvatar 
        : `${getImageUrl(storedAvatar)}?t=${forceRefresh}`;
    }
  }
  
  // Otherwise use the post's original user avatar
  if (post.user?.avatar) {
    return post.user.avatar.startsWith('data:') 
      ? post.user.avatar 
      : `${getImageUrl(post.user.avatar)}?t=${forceRefresh}`;
  }
  
  return '/api/placeholder/48/48';
};


const getPostUserDisplayName = () => {
  if (!post) return '';
  // ONLY use localStorage name for the current logged-in user
  if (post.userId === userId && post.user) {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      return storedName;
    }
  }
  
  // Otherwise use the original user name from the post
  return post.user?.name || post.user?.email || 'Anonymous';
};


    // Return data URLs as-is
    return avatarPath;
  };
  if (loading) {
    return (
      <MainLayout>
        <div className="min-vh-100 d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="container py-5">
          <div className="alert alert-danger">{error || 'Post not found'}</div>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => {
          const prevPath = location.state?.from || '/';
          const prevScrollPosition = location.state?.scrollPosition || 0;

          navigate(prevPath, {
            state: {
              scrollPosition: prevScrollPosition,
            },
            replace: true, // Add this to replace the current history entry
          });
        }}>
        <i className="bi bi-arrow-left me-2"></i>
        Back to Feed
      </button>

      <div className="container py-5">
        {/* Two-Column Layout: Post Content and Image */}
        <div className="row mb-4">
          {/* Post Content (Left Column) */}
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body p-4">
                {/* User Info */}
                <div className="d-flex align-items-center mb-4">
                  <div className="flex-shrink-0">
                    <img
                      src={getUserAvatar()}
                      alt={post.user?.name || 'User'}
                      className="rounded-circle user-avatar-img"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="ms-3">
                    <h6 className="mb-0 fw-bold">{getPostUserDisplayName()}</h6>
                    <p className="text-muted small mb-0">Posted on {formatDate(post.createdAt)}</p>
                  </div>

                  {isOwner && (
                    <div className="ms-auto">
                      <button className="btn btn-outline-primary btn-sm me-2" onClick={handleEditPost}>
                        Edit
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={handleDeletePost}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Title and Category */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h1 className="card-title h3 fw-bold">{getDisplayTitle()}</h1>
                  {post.category && (
                    <span
                      className="badge rounded-pill ms-2"
                      style={{
                        background:
                          post.category === 'RELAXED'
                            ? 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)'
                            : post.category === 'MODERATE'
                            ? 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)'
                            : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                        color: 'white',
                        fontSize: '0.8rem',
                        padding: '0.5rem 1rem',
                      }}>
                      {post.category}
                    </span>
                  )}
                </div>

                {/* Trip Details */}
                <div className="row mb-4">
                  {post.startDate && post.endDate && (
                    <div className="col-md-4 mb-3 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-light p-2">
                            <i className="bi bi-calendar"></i>
                          </div>
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0 small fw-bold text-muted">Dates</h6>
                          <p className="mb-0">
                            {formatDate(post.startDate)} - {formatDate(post.endDate)}
                          </p>
                          <p className="small text-muted mb-0">{calculateDuration(post.startDate, post.endDate)} days</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {post.price !== undefined && (
                    <div className="col-md-4 mb-3 mb-md-0">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-light p-2">
                            <i className="bi bi-cash"></i>
                          </div>
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0 small fw-bold text-muted">Price</h6>
                          <p className="mb-0">${post.price}</p>
                          <p className="small text-muted mb-0">per person</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {post.maxSeats && (
                    <div className="col-md-4">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <div className="rounded-circle bg-light p-2">
                            <i className="bi bi-people"></i>
                          </div>
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0 small fw-bold text-muted">Availability</h6>
                          <p className="mb-0">{post.maxSeats} seats</p>
                          <p className="small text-muted mb-0">{post.bookedSeats || 0} booked</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h5 className="fw-bold">About This Trip</h5>
                  <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                    {post.description}
                  </p>
                </div>

                {/* Destination */}
                {post.destination && (
                  <div className="mb-4">
                    <h5 className="fw-bold">Destination</h5>
                    <p className="mb-0">
                      <i className="bi bi-geo-alt me-2"></i>
                      {post.destination}
                    </p>
                  </div>
                )}

                {/* Actions Row */}
                <div className="border-top pt-4 mt-4">
                  <div className="d-flex justify-content-between">
                    <LikeButton postId={post._id} initialLikes={post.likes} onLikeUpdated={handleLikeUpdate} />

                    <button
                      className="btn rounded-pill d-flex align-items-center gap-2"
                      onClick={() => setShowComments(!showComments)}
                      style={{
                        border: 'none',
                        background: showComments ? 'rgba(13, 110, 253, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        color: showComments ? '#0d6efd' : '#6c757d',
                        padding: '0.5rem 1rem',
                      }}>
                      <i className={`bi ${showComments ? 'bi-chat-fill' : 'bi-chat'}`}></i>
                      <span>{commentCount} Comments</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Post Image (Right Column) */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div
                className="h-100 rounded-4"
                style={{
                  height: '100%',
                  backgroundImage: post.image ? `url(${getImageUrl(post.image)}?t=${forceRefresh})` : 'url(/api/placeholder/800/600)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '400px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Comments Section (Full Width) */}
        {showComments && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4">
                  <CommentSection
                    postId={post._id}
                    initialComments={post.comments || []}
                    commentCount={commentCount}
                    onCommentAdded={handleCommentAdded}
                    key={`comments-${forceRefresh}`} // Force re-render when refreshing
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PostDetailPage;
