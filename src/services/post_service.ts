// src/services/post_service.ts
import apiClient from './api-client';
import { Post } from '../types';

// Define a CreatePostData interface that matches what we're sending to the server
interface CreatePostData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  maxSeats: number;
  bookedSeats: number;
  image: string;
}

// Define an UpdatePostData interface for updating posts
interface UpdatePostData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  maxSeats?: number;
  bookedSeats?: number;
  image?: string;
}

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

  // Create a new post with more flexible typing
  createPost(postData: CreatePostData) {
    console.log('Creating post with data:', postData);
    return apiClient
      .post('/posts', postData)
      .then((response) => {
        console.log('Post created successfully:', response.data);
        return response.data;
      })
      .catch((error) => {
        console.error('Error creating post:', error);
        throw error;
      });
  }

  // Update an existing post - using delete and recreate approach
  // since the server doesn't have a direct update endpoint
  async updatePost(id: string, postData: UpdatePostData) {
    console.log(`Updating post ${id} with data:`, postData);
    try {
      // Step 1: Get the current post data
      const currentPost = await this.getPostById(id);

      // Step 2: Delete the current post
      await this.deletePost(id);

      // Step 3: Create a new post with merged data
      const mergedData = {
        ...currentPost,
        ...postData,
        // Make sure these are properly formatted
        startDate: postData.startDate || currentPost.startDate,
        endDate: postData.endDate || currentPost.endDate,
        price: postData.price ?? currentPost.price,
        maxSeats: postData.maxSeats ?? currentPost.maxSeats,
        bookedSeats: postData.bookedSeats ?? currentPost.bookedSeats,
        image: postData.image || currentPost.image,
        // Preserve the original creation date and likes/comments
        createdAt: currentPost.createdAt,
        likes: currentPost.likes || [],
        comments: currentPost.comments || [],
      };

      // Remove properties that shouldn't be sent to the server
      delete mergedData._id;
      delete mergedData.updatedAt;

      // Create the new post
      const newPost = await this.createPost(mergedData as CreatePostData);
      console.log('Post updated successfully (recreated):', newPost);
      return newPost;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw error;
    }
  }

  // Delete a post
  deletePost(id: string) {
    console.log(`Attempting to delete post with ID: ${id}`);

    return apiClient
      .delete(`/posts/${id}`)
      .then((response) => {
        console.log(`Successfully deleted post ${id}:`, response.data);
        return response.data;
      })
      .catch((error) => {
        console.error(`Error details for deleting post ${id}:`, {
          status: error.response?.status,
          message: error.response?.data,
          error: error.message,
        });
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

  // Upload image
  uploadImage(formData: FormData) {
    console.log('Uploading image');
    return apiClient
      .post('/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        console.log('Image uploaded successfully:', response.data);
        return response.data;
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
        throw error;
      });
  }

  getByUserId(userId: string) {
    return apiClient.get<Post[]>(`/posts?owner=${userId}`).then((res) => res.data);
  }

  savePost(postData: Post) {
    return apiClient.post<Post>('/posts', postData).then((res) => res.data);
  }

  getPaginatedPosts(queryParams: string) {
    return apiClient
      .get(`/posts/paginated?${queryParams}`)
      .then((response) => {
        // Check if we have the expected response structure
        if (response.data && (response.data.posts || Array.isArray(response.data))) {
          // Handle both response formats: { posts: [...], pagination: {...} } or just an array
          if (Array.isArray(response.data)) {
            // If just an array, create a pagination-style response
            return {
              posts: response.data,
              pagination: {
                total: response.data.length,
                page: 1,
                limit: response.data.length,
                pages: 1,
                hasMore: false,
              },
            };
          }
          return response.data;
        }

        // If response doesn't have the expected structure
        throw new Error('Invalid response format from server');
      })
      .catch((error) => {
        console.error('Error fetching paginated posts:', error);
        throw error;
      });
  }
}

export default new PostService();
