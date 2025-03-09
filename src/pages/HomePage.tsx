// src/pages/HomePage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    destination?: string;
  }

  // State for displayed posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const userId = localStorage.getItem('userId');

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  // Show/hide filter panel state
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    destination: '',
    minPrice: '',
    maxPrice: '',
    category: '' as '' | 'RELAXED' | 'MODERATE' | 'INTENSIVE',
  });

  // Active category state
  const [activeCategory, setActiveCategory] = useState<'' | 'RELAXED' | 'MODERATE' | 'INTENSIVE'>('');

  // Reference for intersection observer
  const observer = useRef<IntersectionObserver>();
  // Reference for the element to observe for infinite scrolling
  const lastPostElementRef = useRef<HTMLDivElement>(null);

  // Fetch posts with filters and pagination
  const fetchPosts = useCallback(
    async (pageNum = 1, resetExisting = false) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        } else {
          setPageLoading(true);
        }
        setError(null);

        // Build query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page', pageNum.toString());
        queryParams.append('limit', '5'); // Load 5 posts per page

        // Add filters if present
        if (filters.destination) {
          queryParams.append('destination', filters.destination);
        }

        if (filters.minPrice) {
          queryParams.append('minPrice', filters.minPrice);
        }

        if (filters.maxPrice) {
          queryParams.append('maxPrice', filters.maxPrice);
        }

        if (filters.category) {
          queryParams.append('category', filters.category);
        }

        // First try to use the paginated endpoint
        try {
          // For demonstration, we'll just use getPosts and simulate pagination
          // In a real implementation, you would use your paginated endpoint
          const allPosts = await postService.getPosts();

          // Apply filters client-side
          let filteredPosts = allPosts;

          if (filters.destination) {
            filteredPosts = filteredPosts.filter((post: Post) => post.destination?.toLowerCase().includes(filters.destination.toLowerCase()));
          }

          if (filters.minPrice) {
            const minPrice = Number(filters.minPrice);
            filteredPosts = filteredPosts.filter((post: Post) => post.price !== undefined && post.price >= minPrice);
          }

          if (filters.maxPrice) {
            const maxPrice = Number(filters.maxPrice);
            filteredPosts = filteredPosts.filter((post: Post) => post.price !== undefined && post.price <= maxPrice);
          }

          if (filters.category) {
            filteredPosts = filteredPosts.filter((post: Post) => post.category === filters.category);
          }

          // Simulate pagination
          const startIndex = (pageNum - 1) * 5;
          const endIndex = pageNum * 5;
          const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

          // Update state
          if (resetExisting) {
            setPosts(paginatedPosts);
          } else {
            setPosts((prevPosts) => [...prevPosts, ...paginatedPosts]);
          }

          // Determine if we have more posts to load
          setHasMore(endIndex < filteredPosts.length);
        } catch (paginationError) {
          console.error('Pagination error:', paginationError);
          throw paginationError;
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('Could not load posts. Please try again later.');
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    },
    [filters]
  );

  // Initialize intersection observer
  useEffect(() => {
    // Disconnect previous observer if exists
    if (observer.current) {
      observer.current.disconnect();
    }

    // Create new observer
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !pageLoading) {
          // When the last element is visible and we have more posts to load
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    // Observe the last post element if it exists
    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }

    // Cleanup
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loading, pageLoading]);

  // Load more posts when page changes
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, false);
    }
  }, [page, fetchPosts]);

  // Load initial posts and reset when filters change
  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [filters, fetchPosts]);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters (form submit handler)
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is handled by the useEffect when filters change
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      destination: '',
      minPrice: '',
      maxPrice: '',
      category: '',
    });
    setActiveCategory('');
    setShowFilters(false);
  };

  // Set quick category filter
  const setCategoryFilter = (category: 'RELAXED' | 'MODERATE' | 'INTENSIVE' | '') => {
    setFilters((prev) => ({ ...prev, category }));
    setActiveCategory(category);
  };

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

  // Delete post function
  const handleDeletePost = async (postId: string) => {
    if (isDeletingPost || !postId) {
      return;
    }

    const post = posts.find((p) => p._id === postId);
    if (!post || post.userId !== userId) {
      toast.error('You do not have permission to delete this post');
      return;
    }

    try {
      setIsDeletingPost(true);
      console.log(`Attempting to delete post with ID: ${postId}`);
      await postService.deletePost(postId);
      console.log('Post deleted successfully, updating state');

      // Remove post from posts
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== postId));

      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error details when deleting post:', error);
      toast.error('Error deleting post');
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Edit post function
  const handleEditPost = (postId: string) => {
    const post = posts.find((p) => p._id === postId);
    if (!post || post.userId !== userId) {
      toast.error('You do not have permission to edit this post');
      return;
    }

    navigate(`/edit-post/${postId}`);
  };

  return (
    <MainLayout>
      <style>{styles}</style>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="row">
            <div className="col-md-8 mx-auto text-center">
              <h1 className="hero-title mb-3">Recent Adventures</h1>
              <p className="hero-subtitle">Discover amazing trips from travelers around the world</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container content-container">
        {/* Filter Section */}
        <div className="filter-section mb-4">
          <div className="d-flex justify-content-between align-items-center">
            {/* Category Pills */}
            <div className="category-pills d-flex flex-wrap">
              <button className={`category-pill ${activeCategory === '' ? 'active' : ''}`} onClick={() => setCategoryFilter('')}>
                All
              </button>
              <button className={`category-pill ${activeCategory === 'RELAXED' ? 'active' : ''}`} onClick={() => setCategoryFilter('RELAXED')}>
                Relaxed
              </button>
              <button className={`category-pill ${activeCategory === 'MODERATE' ? 'active' : ''}`} onClick={() => setCategoryFilter('MODERATE')}>
                Moderate
              </button>
              <button className={`category-pill ${activeCategory === 'INTENSIVE' ? 'active' : ''}`} onClick={() => setCategoryFilter('INTENSIVE')}>
                Intensive
              </button>
            </div>

            {/* Filter Toggle Button */}
            <button className="filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              <i className="bi bi-funnel me-2"></i>
              Filter
            </button>
          </div>

          {/* Expandable Advanced Filters */}
          {showFilters && (
            <div className="advanced-filters-panel mt-3">
              <form onSubmit={handleApplyFilters} className="row g-3">
                {/* Destination filter */}
                <div className="col-md-4">
                  <label className="form-label">Destination</label>
                  <input type="text" className="form-control" placeholder="Search location" name="destination" value={filters.destination} onChange={handleFilterChange} />
                </div>

                {/* Price range */}
                <div className="col-md-4">
                  <label className="form-label">Price Range</label>
                  <div className="d-flex gap-2">
                    <input type="number" className="form-control" placeholder="Min" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} min="0" />
                    <input type="number" className="form-control" placeholder="Max" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} min="0" />
                  </div>
                </div>

                {/* Filter action buttons */}
                <div className="col-md-4 d-flex align-items-end">
                  <div className="d-flex gap-2 w-100">
                    <button type="submit" className="btn-apply">
                      Apply
                    </button>
                    <button type="button" className="btn-reset" onClick={resetFilters}>
                      Reset
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Active filter badges */}
          {(filters.destination || filters.minPrice || filters.maxPrice) && (
            <div className="active-filters mt-3">
              <div className="d-flex align-items-center mb-2">
                <small className="text-muted me-2">Active filters:</small>
                <button className="clear-filters-btn" onClick={resetFilters}>
                  Clear all
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {filters.destination && (
                  <span className="filter-badge">
                    {filters.destination}
                    <button className="btn-close-filter" onClick={() => setFilters((prev) => ({ ...prev, destination: '' }))} aria-label="Remove destination filter">
                      ×
                    </button>
                  </span>
                )}

                {(filters.minPrice || filters.maxPrice) && (
                  <span className="filter-badge">
                    Price: ${filters.minPrice || '0'} - ${filters.maxPrice || 'any'}
                    <button className="btn-close-filter" onClick={() => setFilters((prev) => ({ ...prev, minPrice: '', maxPrice: '' }))} aria-label="Remove price filter">
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Feed Content Area */}
        <div className="feed-container">
          {loading && posts.length === 0 ? (
            <div className="loading-container">
              <div className="spinner">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <p>Loading amazing adventures...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <button
                className="btn-retry"
                onClick={() => {
                  setPage(1);
                  fetchPosts(1, true);
                }}>
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">🔍</div>
              <h3>No adventures found</h3>
              <p>
                {filters.destination || filters.minPrice || filters.maxPrice || filters.category
                  ? 'No posts match your current filters. Try adjusting your filters or create your own adventure!'
                  : 'Be the first to share your amazing travel experiences!'}
              </p>
              <button className="btn-create" onClick={() => navigate('/add-post')}>
                Create Post
              </button>
            </div>
          ) : (
            <>
              {/* Instagram-style vertical feed */}
              <div className="posts-feed">
                {posts.map((post, index) => {
                  // If this is the last post in the array and we have more posts to load,
                  // attach the ref for intersection observer
                  const isLastPost = index === posts.length - 1 && hasMore;

                  return (
                    <div key={`post-container-${post._id}-${index}`} className="feed-item" ref={isLastPost ? lastPostElementRef : null}>
                      <PostCard
                        key={`post-${post._id}-${index}`}
                        post={post}
                        onLike={handleLike}
                        onCommentClick={() => handleCommentClick(post._id)}
                        onEdit={() => handleEditPost(post._id)}
                        onDelete={() => handleDeletePost(post._id)}
                        showActions={post.userId === userId}
                      />
                    </div>
                  );
                })}

                {/* Loading indicator when fetching more posts */}
                {pageLoading && (
                  <div className="loading-more">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading more...</span>
                    </div>
                    <p>Loading more adventures...</p>
                  </div>
                )}

                {/* End of posts indicator */}
                {!hasMore && posts.length > 0 && !pageLoading && (
                  <div className="end-of-feed">
                    <div className="end-line"></div>
                    <p>You've reached the end!</p>
                    <div className="end-line"></div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;

// CSS styles - enhanced for a more attractive feed
const styles = `
  /* Hero Section */
  .hero-section {
    background: linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
    padding: 60px 0 70px;
    margin-bottom: -30px;
    border-radius: 0 0 30px 30px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  
  .hero-title {
    color: white;
    font-weight: 700;
    font-size: 2.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .hero-subtitle {
    color: rgba(255,255,255,0.9);
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
  }
  
  /* Content Container */
  .content-container {
    position: relative;
    z-index: 10;
    padding-bottom: 60px;
  }
  
  /* Filter Section */
  .filter-section {
    background: white;
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    margin-bottom: 30px;
  }
  
  /* Category Pills */
  .category-pills {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .category-pill {
    background: #f8f9fa;
    border: none;
    border-radius: 30px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #495057;
    transition: all 0.2s ease;
    cursor: pointer;
  }
  
  .category-pill:hover {
    background: #e9ecef;
    transform: translateY(-2px);
  }
  
  .category-pill.active {
    background: linear-gradient(135deg, #4158D0 0%, #C850C0 100%);
    color: white;
    box-shadow: 0 4px 10px rgba(200, 80, 192, 0.3);
  }
  
  /* Filter Toggle Button */
  .filter-toggle-btn {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 30px;
    padding: 8px 16px;
    font-size: 14px;
    color: #4158D0;
    transition: all 0.2s ease;
  }
  
  .filter-toggle-btn:hover {
    background: #f8f9fa;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  }
  
  /* Advanced Filters Panel */
  .advanced-filters-panel {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    margin-top: 15px;
  }
  
  /* Filter action buttons */
  .btn-apply {
    background: linear-gradient(135deg, #4158D0 0%, #C850C0 100%);
    color: white;
    border: none;
    border-radius: 30px;
    padding: 10px 20px;
    font-weight: 500;
    transition: all 0.2s ease;
    flex-grow: 1;
  }
  
  .btn-apply:hover {
    box-shadow: 0 4px 12px rgba(200, 80, 192, 0.3);
    transform: translateY(-2px);
  }
  
  .btn-reset {
    background: white;
    color: #6c757d;
    border: 1px solid #dee2e6;
    border-radius: 30px;
    padding: 10px 20px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .btn-reset:hover {
    background: #f8f9fa;
    color: #495057;
  }
  
  /* Active Filters */
  .active-filters {
    margin-top: 15px;
  }
  
  .clear-filters-btn {
    background: none;
    border: none;
    color: #4158D0;
    padding: 0;
    font-size: 14px;
    text-decoration: underline;
    transition: color 0.2s ease;
  }
  
  .clear-filters-btn:hover {
    color: #C850C0;
  }
  
  .filter-badge {
    background: #f0f0f0;
    color: #495057;
    border-radius: 30px;
    padding: 5px 12px;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  
  .btn-close-filter {
    background: none;
    border: none;
    color: #6c757d;
    font-size: 16px;
    line-height: 1;
    padding: 0;
    margin-left: 4px;
  }
  
  .btn-close-filter:hover {
    color: #dc3545;
  }
  
  /* Feed Container */
  .feed-container {
    position: relative;
  }
  
  /* Posts Feed */
  .posts-feed {
    max-width: 650px;
    margin: 0 auto;
  }
  
  .feed-item {
    margin-bottom: 25px;
    transition: transform 0.3s ease;
  }
  
  .feed-item:hover {
    transform: translateY(-5px);
  }
  
  /* Post Card Enhancement */
  .post-card {
    border-radius: 15px !important;
    overflow: hidden;
    box-shadow: 0 6px 15px rgba(0,0,0,0.08) !important;
    transition: all 0.3s ease !important;
  }
  
  .post-card:hover {
    box-shadow: 0 10px 25px rgba(0,0,0,0.12) !important;
  }
  
  /* Loading state */
  .loading-container {
    text-align: center;
    padding: 60px 0;
  }
  
  .spinner {
    margin-bottom: 15px;
  }
  
  .spinner-border {
    color: #C850C0;
    width: 3rem;
    height: 3rem;
  }
  
  /* Loading more indicator */
  .loading-more {
    text-align: center;
    padding: 20px 0;
    color: #6c757d;
  }
  
  .loading-more .spinner-border {
    width: 1.5rem;
    height: 1.5rem;
    margin-bottom: 10px;
  }
  
  /* Error state */
  .error-container {
    background: white;
    border-radius: 15px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  }
  
  .error-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .btn-retry {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 10px 25px;
    margin-top: 15px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .btn-retry:hover {
    background: #c82333;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  }
  
  /* Empty state */
  .empty-container {
    background: white;
    border-radius: 15px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 15px;
  }
  
  .btn-create {
    background: linear-gradient(135deg, #4158D0 0%, #C850C0 100%);
    color: white;
    border: none;
    border-radius: 30px;
    padding: 12px 30px;
    margin-top: 15px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(200, 80, 192, 0.3);
  }
  
  .btn-create:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(200, 80, 192, 0.4);
  }
  
  /* End of feed indicator */
  .end-of-feed {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px 0;
    color: #6c757d;
    gap: 15px;
  }
  
  .end-line {
    height: 1px;
    background: #dee2e6;
    width: 80px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .hero-section {
      padding: 40px 0 50px;
    }
    
    .hero-title {
      font-size: 2rem;
    }
    
    .posts-feed {
      max-width: 100%;
    }
    
    .filter-section {
      padding: 15px;
    }
    
    .category-pills {
      overflow-x: auto;
      padding-bottom: 5px;
      flex-wrap: nowrap;
    }
  }
`;
