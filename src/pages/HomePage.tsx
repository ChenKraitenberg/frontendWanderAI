import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import userService, { User } from '../services/user_service';
//import postService from '../services/post_service';
import tripService from '../services/trip_service';
//import { Post } from '../services/post_service';
import { Trip } from '../types';

const Homepage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [posts, setPosts] = useState<Trip[]>([]);

  useEffect(() => {
    const checkAuthAndFetchPosts = async () => {
      try {
        setLoading(true);

        // בדיקה האם המשתמש חדש
        const newUser = localStorage.getItem('isNewUser') === 'true';
        setIsNewUser(newUser);
        if (newUser) {
          localStorage.removeItem('isNewUser');
        }

        // שליפת המשתמש
        const { request } = userService.getMe();
        const response = await request;
        setUser(response.data);
        console.log('User data loaded:', response.data);

        // לאחר שיש לנו משתמש/טוקן, אפשר להביא את הפוסטים
        // (או כלל הפוסטים, או רק לפי userId)
        const postsResponse = await tripService.getAll();
        setPosts(postsResponse);
        console.log('Posts loaded:', postsResponse);
      } catch (error) {
        console.error('Failed to load user data or posts:', error);
        setError('Failed to load user data. Please login again.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchPosts();
  }, [navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your data, please wait...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="alert alert-danger" role="alert">
          {error} <br />
          <a href="/login" className="btn btn-primary mt-2">
            Login Again
          </a>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="text-center py-4">
        <h1>{isNewUser ? 'Welcome!' : `Welcome back, ${user?.email || 'Guest'}`}</h1>
        {posts.length > 0 && (
          <div>
            <h2>Recent Posts</h2>
            {posts.map((p) => (
              <div key={p._id}>
                <h4>{p.description}</h4>
                <p>{p.likes} likes</p>
                {/* וכו׳ */}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Homepage;
