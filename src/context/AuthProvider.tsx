// src/contexts/AuthProvider.tsx
import React, { ReactNode, useState, useEffect } from 'react';
import authService, { SocialLoginCredentials } from '../services/auth_service';
import { toast } from 'react-toastify';
import AuthContext, { User } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // בדיקה האם המשתמש מאומת במעמד ההרצה
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
          setIsAuthenticated(true);

          // אם יש אימות – נסה למשוך את נתוני המשתמש
          try {
            // ניתן לממש קריאה לשרת לקבלת פרטי המשתמש (למשל: userService.getMe())
            setUser({
              _id: userId,
              email: localStorage.getItem('userEmail') || '',
              name: localStorage.getItem('userName') || '',
              avatar: localStorage.getItem('userAvatar') || '',
            });
          } catch (err) {
            console.error('Failed to fetch user data', err);
            // אם משיכת נתוני המשתמש נכשלה, ננסה לרענן את הטוקן
            await refreshAuth();
          }
        }
      } catch (err) {
        console.error('Authentication check failed', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // הגדרת רענון אוטומטי של הטוקן
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;

    if (isAuthenticated) {
      // לדוגמה, רענון כל 10 דקות
      refreshTimer = setInterval(() => {
        refreshAuth().catch((err) => {
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

      // שמירת פרטי המשתמש ב-localStorage
      localStorage.setItem('userEmail', response.user?.email || email);
      if (response.user?.name) localStorage.setItem('userName', response.user.name);
      if (response.user?.avatar) localStorage.setItem('userAvatar', response.user.avatar);

      toast.success('Login successful!');
    } catch (err) {
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

      const response = await authService.register(email, password, name, avatar);

      setIsAuthenticated(true);
      setUser({
        _id: response._id,
        email: response.user?.email || email,
        name: response.user?.name || name,
        avatar: response.user?.avatar || avatar,
      });

      localStorage.setItem('userEmail', response.user?.email || email);
      if (name) localStorage.setItem('userName', name);
      if (avatar) localStorage.setItem('userAvatar', avatar);

      toast.success('Registration successful!');
    } catch (err) {
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

      const response = await authService.socialLogin(credentials);

      setIsAuthenticated(true);
      setUser({
        _id: response._id,
        email: credentials.email || '',
        name: credentials.name,
        avatar: credentials.avatar,
      });

      if (credentials.email) localStorage.setItem('userEmail', credentials.email);
      if (credentials.name) localStorage.setItem('userName', credentials.name);
      if (credentials.avatar) localStorage.setItem('userAvatar', credentials.avatar);

      toast.success(`Logged in with ${credentials.provider.charAt(0).toUpperCase() + credentials.provider.slice(1)}!`);
    } catch (err) {
      console.error('Social login error:', err);
      setError(`Failed to login with ${credentials.provider}`);
      toast.error(`Failed to login with ${credentials.provider}. Please try again.`);
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

      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userAvatar');

      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.refreshToken();

      setIsAuthenticated(true);

      // handle the response internally
    } catch (err) {
      console.error('Token refresh error:', err);
      setIsAuthenticated(false);
      setUser(null);

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
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
