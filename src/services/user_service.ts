// user_service.ts
import apiClient, { CanceledError } from './api-client';

export { CanceledError };

export interface User {
  _id?: string;
  email: string;
  password?: string;
  name?: string; // Added name property
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
    formData.append('file', img);

    const abortController = new AbortController();
    const request = apiClient
      .post<{ url: string }>('/file', formData, {
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
    const formData = new FormData();
    formData.append('file', file);

    return apiClient
      .post('/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        console.log('Profile image upload response:', response.data);
        return response.data;
      })
      .catch((error) => {
        console.error('Error uploading profile image:', error);
        throw error;
      });
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
}

export default new UserService();
