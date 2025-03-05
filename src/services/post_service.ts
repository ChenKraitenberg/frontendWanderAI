// import apiClient from './api-client';
// import { Post, SavedTrip, GeneratedTrip } from '../types';

// class PostService {
//   async saveTrip(tripData: GeneratedTrip): Promise<SavedTrip> {
//     try {
//       const response = await apiClient.post<SavedTrip>('/trips', tripData);
//       return response.data;
//     } catch (error) {
//       console.error('Error saving trip:', error);
//       throw error;
//     }
//   }

//   getAll(userId?: string) {
//     const url = userId ? `/trips?userId=${userId}` : '/trips';
//     return apiClient.get<Post[]>(url).then((res) => res.data);
//   }

//   async createPost(postData: { name: string; description: string; startDate: string; endDate: string; price: number; maxSeats: number; image?: string }) {
//     console.log('Creating post with data:', postData);
//     try {
//       const response = await apiClient.post('/trips', {
//         name: postData.name,
//         description: postData.description,
//         startDate: postData.startDate,
//         endDate: postData.endDate,
//         price: postData.price,
//         maxSeats: postData.maxSeats,
//         bookedSeats: 0,
//         image: postData.image,
//         comments: [],
//         likes: [],
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error creating post:', error);
//       throw error;
//     }
//   }

//   likePost(postId: string) {
//     return apiClient.post(`/trips/${postId}/like`);
//   }

//   addComment(postId: string, text: string) {
//     return apiClient.post(`/trips/${postId}/comment`, { text });
//   }

//   getPosts() {
//     return apiClient.get<Post[]>('/trips').then((res) => res.data);
//   }

//   getByUserId(userId: string) {
//     return apiClient.get<Post[]>(`/trips?userId=${userId}`).then((res) => res.data);
//   }

//   async uploadImage(formData: FormData) {
//     try {
//       const response = await apiClient.post('/file', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       console.log('Image upload response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       throw error;
//     }
//   }

//   deletePost(postId: string) {
//     return apiClient.delete(`/trips/${postId}`);
//   }

//   getComments(postId: string) {
//     return apiClient.get<Comment[]>(`/trips/${postId}/comments`);
//   }
// }

// export default new PostService();
// src/services/post_service.ts
import apiClient from './api-client';
import { Post } from '../types';

class PostService {
  // Get all posts
  getPosts() {
    return apiClient
      .get('/posts')
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error fetching posts:', error);
        throw error;
      });
  }

  // Get a single post by ID
  getPostById(id: string) {
    return apiClient
      .get(`/posts/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error fetching post ${id}:`, error);
        throw error;
      });
  }

  // Create a new post
  createPost(postData: { title: string; content: string; author: string }) {
    return apiClient
      .post('/posts', postData)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Error creating post:', error);
        throw error;
      });
  }

  // Delete a post
  deletePost(id: string) {
    return apiClient
      .delete(`/posts/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error deleting post ${id}:`, error);
        throw error;
      });
  }

  // Like a post
  likePost(id: string) {
    return apiClient
      .post(`/posts/${id}/like`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error liking post ${id}:`, error);
        throw error;
      });
  }

  // Add a comment
  addComment(id: string, text: string) {
    return apiClient
      .post(`/posts/${id}/comment`, { text })
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error commenting on post ${id}:`, error);
        throw error;
      });
  }

  // Get comments for a post
  getComments(id: string) {
    return apiClient
      .get(`/posts/${id}/comments`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error fetching comments for post ${id}:`, error);
        throw error;
      });
  }

  getByUserId(userId: string) {
    return apiClient.get<Post[]>(`/posts?userId=${userId}`).then((res) => res.data);
  }

  savePost(postData: Post) {
    return apiClient.post<Post>('/posts', postData).then((res) => res.data);
  }
}

export default new PostService();
