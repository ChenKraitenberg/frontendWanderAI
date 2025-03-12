// src/context/AuthProvider.tsx
import React, { ReactNode, useState, useEffect } from 'react';
import authService, { SocialLoginCredentials } from '../services/auth_service';
import { toast } from 'react-toastify';
import AuthContext, { User } from './AuthContext';
import userService from '../services/user_service';
import postService from '../services/post_service';

interface AuthProviderProps {
  children: ReactNode;
}

const isErrorWithResponse = (error: unknown): error is { response: { data: { message?: string } } } => {
  return typeof error === 'object' && error !== null && 'response' in error;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
          setIsAuthenticated(true);

          // If authenticated, try to fetch user data
          try {
            // אפשר להחליף זאת בקריאה ל-userService.getMe()
            setUser({
              _id: userId,
              email: localStorage.getItem('userEmail') || '',
              name: localStorage.getItem('userName') || '',
              avatar: localStorage.getItem('userAvatar') || '',
            });
          } catch (err: unknown) {
            console.error('Failed to fetch user data', err);
            // במקרה של כישלון, מנסים לרענן את הטוקן
            await refreshAuth();
          }
        }
      } catch (err: unknown) {
        console.error('Authentication check failed', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up automatic token refresh every 10 דקות
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;

    if (isAuthenticated) {
      refreshTimer = setInterval(() => {
        refreshAuth().catch((err: unknown) => {
          console.error('Failed to refresh token', err);
          logout();
        });
      }, 10 * 60 * 1000);
    }

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(email, password);

      setIsAuthenticated(true);
      setUser({
        _id: response._id,
        email: response.user?.email || email,
        name: response.user?.name,
        avatar: response.user?.avatar,
      });

      // Store user info in localStorage
      localStorage.setItem('userEmail', response.user?.email || email);
      if (response.user?.name) localStorage.setItem('userName', response.user.name);
      if (response.user?.avatar) localStorage.setItem('userAvatar', response.user.avatar);

      toast.success('Login successful!');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      toast.error('Login failed: Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string, avatar?: string) => {
    try {
      setLoading(true);
      setError(null);

      // יש לוודא שקיים שם למשתמש
      if (!name) {
        setError('Username is required');
        toast.error('Registration failed: Username is required');
        throw new Error('Username is required');
      }

      const response = await authService.register(email, password, name, avatar);

      setIsAuthenticated(true);
      setUser({
        _id: response._id,
        email: response.user?.email || email,
        name: response.user?.name || name,
        avatar: response.user?.avatar || avatar,
      });

      // Store user info in localStorage
      localStorage.setItem('userEmail', response.user?.email || email);
      localStorage.setItem('userName', name);
      if (avatar) localStorage.setItem('userAvatar', avatar);

      toast.success('Registration successful!');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      toast.error('Registration failed. Please check your information and try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (credentials: SocialLoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      // Debug log
      console.log(`AuthProvider: Processing social login for ${credentials.provider}, email: ${credentials.email}`);

      // יש לוודא שקיים אימייל
      if (!credentials.email) {
        setError('Email is required for social login');
        throw new Error('Email is required for social login');
      }

      const response = await authService.socialLogin(credentials);

      setIsAuthenticated(true);

      // בניית האובייקט המשתמש
      const user: User = {
        _id: response._id,
        email: response.user?.email || credentials.email || '',
        name: response.user?.name || credentials.name || '',
        avatar: response.user?.avatar || credentials.avatar || '',
      };

      setUser(user);

      // Store user info in localStorage
      localStorage.setItem('userEmail', user.email);
      if (user.name) localStorage.setItem('userName', user.name);
      if (user.avatar) localStorage.setItem('userAvatar', user.avatar);

      toast.success(`Logged in with ${credentials.provider}!`);
      console.log(`AuthProvider: Social login successful for user ID: ${response._id}`);

      //return response;
    } catch (err: unknown) {
      console.error('Social login error:', err);
      if (isErrorWithResponse(err) && err.response.data?.message) {
        setError(`Social login failed: ${err.response.data.message}`);
        toast.error(`Login failed: ${err.response.data.message}`);
      } else {
        setError(`Failed to login with ${credentials.provider}`);
        toast.error(`Failed to login with ${credentials.provider}. Please try again.`);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();

      setIsAuthenticated(false);
      setUser(null);

      // נקה את הפרטים ב-localStorage
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userAvatar');

      toast.success('Logged out successfully');
    } catch (err: unknown) {
      console.error('Logout error:', err);
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await authService.refreshToken();

      setIsAuthenticated(true);

      // עדכון נתוני המשתמש במידה וקיימים
      if (response.user) {
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            ...response.user,
            _id: response._id || prev._id,
            email: response.user?.email || prev.email,
          };
        });

        // עדכון localStorage
        if (response.user.email) localStorage.setItem('userEmail', response.user.email);
        if (response.user.name) localStorage.setItem('userName', response.user.name);
        if (response.user.avatar) localStorage.setItem('userAvatar', response.user.avatar);
      }

      toast.success('Token refreshed successfully');
    } catch (err: unknown) {
      console.error('Token refresh error:', err);
      setIsAuthenticated(false);
      setUser(null);
      toast.error('Failed to refresh token. Please log in again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);

      // 1. Update the user profile
      const response = await userService.updateProfile(userData);

      // 2. Update localStorage values
      if (userData.name) {
        localStorage.setItem('userName', userData.name);
      }
      if (userData.avatar) {
        localStorage.setItem('userAvatar', userData.avatar);
        localStorage.setItem('userAvatarTimestamp', Date.now().toString()); // Add this line
      }

      // 3. Update the user state
      setUser((prev) => {
        if (!prev) return null;
        return { ...prev, ...userData };
      });

      // 4. Now update all posts AND comments by this user
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          console.log('Updating user information in all posts and comments...');

          // Update all comments made by this user in any post
          await postService.updateUserInfoInAllComments(userId, userData);

          console.log('Successfully updated user info in posts and comments');

          // Dispatch a custom event to notify components about the avatar update
          window.dispatchEvent(
            new CustomEvent('user-avatar-updated', {
              detail: {
                userId,
                avatar: userData.avatar,
                name: userData.name,
                timestamp: Date.now(),
              },
            })
          );
        } catch (updateError) {
          console.error('Error updating posts/comments with new user info:', updateError);
          // Don't throw error here - we still want profile update to succeed
        }
      }

      return response;
    } catch (err: unknown) {
      console.error('Failed to update profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        socialLogin,
        logout,
        refreshAuth,
        updateUserProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
