// src/services/user_service.ts
import apiClient, { CanceledError } from './api-client';
import postService from './post_service';

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

  uploadImage(img: File) {
    const formData = new FormData();
    formData.append('image', img); // Using 'image' as the key

    const abortController = new AbortController();
    const request = apiClient
      .post<{ url: string }>('/file/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: abortController.signal,
      })
      .then((response) => {
        console.log('Full upload response:', response);
        return response;
      });

    return {
      request,
      abort: () => abortController.abort(),
    };
  }

  uploadProfileImage(file: File) {
    // Create FormData
    const formData = new FormData();
    formData.append('image', file);

    console.log('Uploading image with FormData:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    return apiClient
      .post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        console.log('Profile image upload full response:', response);

        if (!response.data || !response.data.url) {
          console.error('Invalid response format from server:', response.data);
          throw new Error('Server did not return a valid image URL');
        }

        // Ensure the URL is properly formatted
        let imageUrl = response.data.url;

        // For debugging
        console.log('Original image URL from server:', imageUrl);

        // Clean up the URL if needed
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          // Make sure it starts with /uploads/
          if (!imageUrl.startsWith('/uploads/')) {
            imageUrl = '/uploads/' + imageUrl.replace('uploads/', '');
          }
        }

        console.log('Normalized image URL:', imageUrl);

        return {
          ...response.data,
          url: imageUrl,
        };
      })
      .catch((error) => {
        console.error('Error uploading profile image:', error);
        throw error;
      });
  }

  updateProfile(userData: Partial<User>) {
    const token = localStorage.getItem('accessToken');
    console.log('Updating profile with data:', userData);

    // If we're updating the avatar, ensure it's properly formatted
    if (userData.avatar) {
      console.log('Avatar before normalization:', userData.avatar);
      // Make sure it's a valid URL or path
      if (!userData.avatar.startsWith('http') && !userData.avatar.startsWith('data:')) {
        // Ensure it has /uploads/ prefix
        if (!userData.avatar.startsWith('/uploads/')) {
          userData.avatar = '/uploads/' + userData.avatar.replace('uploads/', '');
        }
      }
      console.log('Avatar after normalization:', userData.avatar);
    }

    return apiClient
      .put('/auth/me', userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('Profile update response:', response.data);

        // Update localStorage with new data
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
      })
      .catch((error) => {
        console.error('Logout error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        throw error;
      });

    return { request };
  }

  async updateUserPostsWithProfileInfo(userId: string, profileData: { name?: string; avatar?: string }) {
    console.log('Updating posts for user', userId, 'with profile data:', profileData);

    try {
      // Use the post service to update all posts with new user info
      const result = await postService.updateUserInfoInAllPosts(userId, profileData);
      console.log('Updated posts result:', result);
      return { success: true, count: result };
    } catch (error) {
      console.error('Failed to update user posts with profile info:', error);
      throw error;
    }
  }
}

export default new UserService();
