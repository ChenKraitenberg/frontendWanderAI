import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService, { User } from '../services/user_service';
import post_service from '../services/post_service';
import MapComponent from '../components/MapComponent';
import Footer from '../components/shared/Footer';
import { getImageUrl } from '../utils/imageUtils';
import PostCard from '../components/PostCard';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import { SavedPost } from '../types';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { request } = userService.getMe();
        const response = await request;
        setUser(response.data);

        if (response.data._id) {
          try {
            const userPosts = await post_service.getByUserId(response.data._id);

            setPosts(userPosts);
          } catch (error) {
            console.error('Failed to load trips:', error);
            setPosts([]);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

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

  const handleDownloadPost = (post: SavedPost) => {
    try {
      const fileContent = `${post.title}\n\n${post.description}\n\n${post.itinerary?.join('\n\n') || ''}
        \nPost Details:
        - Duration: ${post.duration} days
        - Category: ${post.category}`;

      const element = document.createElement('a');
      const file = new Blob([fileContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Post downloaded successfully');
    } catch (error) {
      console.error('Failed to download post:', error);
      toast.error('Failed to download post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await post_service.deletePost(postId);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
      toast.success('Post deleted successfully');
      setPostToDelete(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
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
                <div
                  className="rounded-4 shadow-lg border-4 border-white"
                  style={{
                    width: '120px',
                    height: '120px',
                    backgroundImage: user?.avatar ? `url(${getImageUrl(user.avatar)})` : 'url(/api/placeholder/120/120)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>
            </div>
            <div className="col text-white">
              <h1 className="display-6 fw-bold mb-2">{user?.email}</h1>
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex-grow-1" style={{ marginTop: '-3rem' }}>
        {/* Map Section */}
        <div className="card border-0 shadow-lg rounded-4 mb-4">
          <div className="card-body p-4">
            <h3 className="h5 mb-4">My Travel Map</h3>
            {user?._id && <MapComponent userId={user._id} />}
          </div>
        </div>

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
                  <div key={post._id} className="col-md-6 col-lg-4">
                    <PostCard
                      post={post}
                      onDownload={() => handleDownloadPost(post)}
                      onDelete={() => setPostToDelete(post._id)}
                      onLike={() => console.log('Liked post', post._id)}
                      onCommentClick={() => console.log('Comment clicked for post', post._id)}
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

      <DeleteConfirmationDialog isOpen={!!postToDelete} onClose={() => setPostToDelete(null)} onConfirm={() => postToDelete && handleDeletePost(postToDelete)} />

      <Footer />
    </div>
  );
};

export default ProfilePage;
