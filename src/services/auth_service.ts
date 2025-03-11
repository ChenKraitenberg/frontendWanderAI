// src/services/auth_service.ts
import apiClient from './api-client';

export interface SocialLoginCredentials {
  provider: 'google';
  token: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  _id: string;
  user?: {
    email: string;
    name?: string;
    avatar?: string;
  };
}

export interface CheckUserResponse {
  exists: boolean;
  userId?: string;
}

class AuthService {
  // Internal login with email/password
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });

      // Store tokens and user info
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userId', response.data._id);

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Register with email/password
  async register(email: string, password: string, name?: string, avatar?: string): Promise<AuthResponse> {
    try {
      const userData = {
        email,
        password,
        name,
        avatar,
      };

      const response = await apiClient.post('/auth/register', userData);

      // Store tokens and user info
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('userId', response.data.user._id);

      return {
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken || '',
        _id: response.data.user._id,
        user: response.data.user,
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async checkIfUserExists(email: string): Promise<{ exists: boolean; userId?: string }> {
    try {
      // Use the dedicated endpoint
      const response = await apiClient.post('/auth/check-user', { email });
      return response.data;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      // Default to false if there's an error
      return { exists: false };
    }
  }

  // External/Social login with Google or Facebook
  async socialLogin(credentials: SocialLoginCredentials): Promise<AuthResponse> {
    try {
      console.log(`Attempting social login with ${credentials.provider} for email: ${credentials.email}`);

      const response = await apiClient.post('/auth/social-login', credentials);

      // Store tokens and user info
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userId', response.data._id);

      // Also store additional user info if available
      if (response.data.user?.email) {
        localStorage.setItem('userEmail', response.data.user.email);
      }
      if (response.data.user?.name) {
        localStorage.setItem('userName', response.data.user.name);
      }
      if (response.data.user?.avatar) {
        localStorage.setItem('userAvatar', response.data.user.avatar);
      }

      console.log(`Social login successful for ${credentials.email}, user ID: ${response.data._id}`);
      return response.data;
    } catch (error) {
      console.error('Social login failed:', error);
      throw error;
    }
  }

  // Logout (both internal and external)
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error (API):', error);
    } finally {
      // Always clear local storage regardless of API success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', { refreshToken });

      // Update stored tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }

  // Request password reset (send email)
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/request-reset', { email });
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  // Validate password reset token
  async validateResetToken(token: string): Promise<void> {
    try {
      await apiClient.get(`/auth/validate-reset-token/${token}`);
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  }
}

export default new AuthService();
