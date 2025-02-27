// user_service.ts
import apiClient, { CanceledError } from './api-client';

export { CanceledError };

export interface User {
  _id?: string;
  email: string;
  password?: string;
  avatar?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string; // לא אופציונלי כי תמיד מגיע
  _id: string; // לא אופציונלי כי תמיד מגיע
}

export interface RegisterResponse {
  token: string;
  user: User;
}

class UserService {
  login(email: string, password: string) {
    const abortController = new AbortController();
    const request = apiClient.post<LoginResponse>('/auth/login', { email, password }, { signal: abortController.signal }).then((response) => {
      // שמירת הטוקנים אוטומטית
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
    // שליחת הבקשה לשרת
    const request = apiClient
      .post<RegisterResponse>('/auth/register', user, {
        signal: abortController.signal,
      })
      .then((response) => {
        // בדיקה שאנחנו מקבלים את הטוקן
        if (!response.data.token) {
          throw new Error('No access token received');
        }

        // שמירת הטוקן
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
    console.log('Token being used:', token); // לבדיקה

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

  // נתקן את הפונקציה uploadImage בUserService
  // user_service.ts
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
        console.log('Full upload response:', response); // לבדיקה
        return response;
      });

    return {
      request,
      abort: () => abortController.abort(),
    };
  }

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    const request = apiClient.post('/auth/logout', { refreshToken }).then(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    });

    return { request };
  }

  // implement the getCurrentUser function in UserService
}

export default new UserService();
