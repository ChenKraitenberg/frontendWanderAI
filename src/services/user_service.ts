// src/services/user_service.ts
import apiClient, { CanceledError } from './api-client';

export { CanceledError };

export interface User {
  _id?: string;
  email: string;
  password?: string;
  name?: string;
  avatar?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  _id: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

class UserService {
  login(email: string, password: string) {
    const abortController = new AbortController();
    const request = apiClient.post<LoginResponse>('/auth/login', { email, password }, { signal: abortController.signal }).then((response) => {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userId', response.data._id);
      return response;
    });

    return {
      request,
      abort: () => abortController.abort(),
    };
  }

  register(user: User) {
    const abortController = new AbortController();
    const request = apiClient
      .post<RegisterResponse>('/auth/register', user, {
        signal: abortController.signal,
      })
      .then((response) => {
        if (!response.data.token) {
          throw new Error('No access token received');
        }

        localStorage.setItem('accessToken', response.data.token);
        if (response.data.user._id) {
          localStorage.setItem('userId', response.data.user._id);
        } else {
          throw new Error('User ID is undefined');
        }

        console.log('Token saved after registration:', response.data.token);

        return response;
      });

    return {
      request,
      abort: () => abortController.abort(),
    };
  }

  getMe() {
    const token = localStorage.getItem('accessToken');
    console.log('Token being used:', token);

    const abortController = new AbortController();
    const request = apiClient.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: abortController.signal,
    });

    return {
      request,
      abort: () => abortController.abort(),
    };
  }

  // Updated to handle multiple upload endpoints
  uploadImage(img: File) {
    const formData = new FormData();
    formData.append('file', img);

    const abortController = new AbortController();
    const request = this.tryMultipleUploadEndpoints(formData, abortController);

    return {
      request,
      abort: () => abortController.abort(),
    };
  }

  // Helper method to try multiple upload endpoints
  private async tryMultipleUploadEndpoints(formData: FormData, abortController: AbortController) {
    // Try multiple endpoints in sequence until one works
    const endpoints = [
      '/file', // First try the root endpoint
      '/file/upload', // Then try the upload-specific endpoint
      '/uploads', // Some servers use this convention
      '/api/uploads', // Another common convention
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting to upload to endpoint: ${endpoint}`);
        const response = await apiClient.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: abortController.signal,
          timeout: 10000, // 10 second timeout
        });

        console.log(`Upload successful to ${endpoint}:`, response);
        return response;
      } catch (error) {
        console.warn(`Upload failed to ${endpoint}:`, error);
        lastError = error;
        // Continue to next endpoint
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error('All upload endpoints failed');
  }

  uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    // Try multiple endpoints in sequence
    return this.tryUploadEndpoints(formData);
  }

  // More comprehensive helper method for profile image uploads
  private async tryUploadEndpoints(formData: FormData) {
    const endpoints = [
      '/file', // First try the root endpoint
      '/file/upload', // Then try the upload-specific endpoint
      '/uploads', // Some servers use this convention
      '/api/uploads', // Another common convention
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting to upload profile image to endpoint: ${endpoint}`);
        const response = await apiClient.post(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 10000, // 10 second timeout
        });

        console.log(`Upload successful to ${endpoint}:`, response.data);
        return response.data;
      } catch (error) {
        console.warn(`Upload failed to ${endpoint}:`, error);
        lastError = error;
        // Continue to next endpoint
      }
    }

    // If we get here, all endpoints failed
    throw lastError || new Error('All upload endpoints failed');
  }

  updateProfile(userData: Partial<User>) {
    const token = localStorage.getItem('accessToken');

    return apiClient
      .put('/auth/me', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('Profile update response:', response.data);

        // Update local storage if name or avatar was updated
        if (userData.name) {
          localStorage.setItem('userName', userData.name);
        }
        if (userData.avatar) {
          localStorage.setItem('userAvatar', userData.avatar);
        }

        return response.data;
      })
      .catch((error) => {
        console.error('Failed to update profile:', error);
        throw error;
      });
  }

  logout(refreshToken?: string) {
    const token = refreshToken || localStorage.getItem('refreshToken');

    if (!token) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userAvatar');
      return { request: Promise.resolve() };
    }

    const request = apiClient
      .post(
        '/auth/logout',
        { refreshToken: token },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      .then(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatar');
      })
      .catch((error) => {
        console.error('Logout error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatar');
        throw error;
      });

    return { request };
  }
}

export default new UserService();
