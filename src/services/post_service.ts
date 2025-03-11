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
  getPosts = async (queryParams?: string) => {
    const url = queryParams ? `/posts?${queryParams}` : '/posts';
    console.log('Fetching posts with URL:', url);

    try {
      const response = await apiClient.get(url);
      console.log('Fetched posts:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  // Get a single post by ID
  getByUserId = async (userId: string) => {
    console.log('Service: Fetching posts for user ID:', userId);

    // Try the user-specific endpoint first
    try {
      const response = await apiClient.get<Post[]>(`/posts/user/${userId}`);
      console.log(`Fetched ${response.data.length} posts for user ${userId} via /posts/user/:id endpoint`);
      if (response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.log('Error with user endpoint, trying alternative methods:', error);
    }

    // If that fails or returns empty, try with query params
    try {
      // Try by owner
      const ownerResponse = await apiClient.get<Post[]>(`/posts?owner=${userId}`);
      if (ownerResponse.data.length > 0) {
        console.log(`Fetched ${ownerResponse.data.length} posts for user ${userId} via owner query`);
        return ownerResponse.data;
      }

      // Try by userId
      const userIdResponse = await apiClient.get<Post[]>(`/posts?userId=${userId}`);
      if (userIdResponse.data.length > 0) {
        console.log(`Fetched ${userIdResponse.data.length} posts for user ${userId} via userId query`);
        return userIdResponse.data;
      }

      // If still no posts, try filtering all posts
      const allPosts = await this.getPosts();
      const userPosts = allPosts.filter((post: Post) => post.userId === userId || post.user?._id === userId);

      if (userPosts.length > 0) {
        console.log(`Found ${userPosts.length} posts for user ${userId} via client-side filtering`);
        return userPosts;
      }

      // If we get here, there are no posts for this user
      console.log(`No posts found for user ${userId} via any method`);
      return [];
    } catch (error) {
      console.error('Error fetching posts by user ID:', error);
      return [];
    }
  };

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

  // Get a single post by ID
  getPostById = async (id: string) => {
    try {
      const response = await apiClient.get<Post>(`/posts/${id}`);
      console.log(`Fetched post with ID ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post with ID ${id}:`, error);
      throw error;
    }
  };

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
        // Preserve the original user info if not explicitly changed
        user: postData.name || currentPost.user,
        // Preserve the original creation date and likes/comments
        createdAt: currentPost.createdAt,
        likes: currentPost.likes || [],
        comments: currentPost.comments || [],
      };

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
  likePost = async (id: string) => {
    if (!id) {
      console.error('Post ID is required');
      throw new Error('Post ID is required');
    }

    try {
      const userId = localStorage.getItem('userId');
      console.log(`Toggling like for post ${id} (user: ${userId})`);

      const response = await apiClient.post(`/posts/${id}/like`);

      // Log success
      console.log(`Like API response for post ${id}:`, response);

      // Ensure the response contains the expected data
      if (!response.data) {
        console.warn('Empty response from server');
        throw new Error('Invalid server response');
      }

      if (response.data.likes) {
        console.log(`Like toggled successfully for post ${id}:`, response.data);
        return response.data;
      } else if (Array.isArray(response.data)) {
        console.log(`Like toggled successfully (array response) for post ${id}:`, response.data);
        return {
          _id: id,
          likes: response.data,
        };
      } else {
        console.warn('Unexpected response format:', response.data);
        return {
          _id: id,
          likes: [],
          ...response.data,
        };
      }
    } catch (error) {
      console.error(`Error toggling like for post ${id}:`, error);
      throw error;
    }
  };

  // Add a comment
  addComment(id: string, text: string) {
    if (!id) {
      console.error('Post ID is required');
      throw new Error('Post ID is required');
    }

    console.log(`Adding comment to post ${id}`);
    return apiClient
      .post(`/posts/${id}/comment`, { text })
      .then((response) => {
        console.log(`Comment added to post ${id}:`, response.data);
        return response.data;
      })
      .catch((error) => {
        console.error(`Error commenting on post ${id}:`, error);
        throw error;
      });
  }

  // Get comments for a post
  getComments(id: string) {
    if (!id) {
      console.error('Post ID is required');
      throw new Error('Post ID is required');
    }

    console.log(`Fetching comments for post ${id}`);
    return apiClient
      .get(`/posts/${id}/comments`)
      .then((response) => {
        console.log(`Fetched comments for post ${id}:`, response.data);
        return response.data;
      })
      .catch((error) => {
        console.error(`Error fetching comments for post ${id}:`, error);
        throw error;
      });
  }

  // Upload image
  uploadImage(formData: FormData) {
    console.log('Uploading image');
    return apiClient
      .post('/file/upload', formData, {
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

  async updateUserInfoInAllPosts(userId: string, updatedUserInfo: { name?: string; avatar?: string }) {
    try {
      console.log(`Starting to update user info in all posts for user ${userId}:`, updatedUserInfo);

      // First get all posts by this user
      const userPosts = await this.getByUserId(userId);
      console.log(`Found ${userPosts.length} posts to update`);

      if (userPosts.length === 0) {
        console.log('No posts found for this user');
        return 0;
      }

      // Keep track of successful updates
      let updatedCount = 0;

      // Update each post one by one
      for (const post of userPosts) {
        try {
          console.log(`Updating post ${post._id}`);

          // Get the current post to make sure we have the latest version
          const currentPost = await this.getPostById(post._id);

          // IMPORTANT: Preserve existing user information
          const updatedPost = {
            ...currentPost,
            user: {
              ...currentPost.user, // Preserve all existing user data
              _id: userId,
              // Only update the specific fields that were provided
              ...(updatedUserInfo.name !== undefined ? { name: updatedUserInfo.name } : {}),
              ...(updatedUserInfo.avatar !== undefined ? { avatar: updatedUserInfo.avatar } : {}),
            },
          };

          // Try using our update method
          await this.updatePost(post._id, {
            user: updatedPost.user,
          });

          console.log(`Post ${post._id} updated via updatePost`);
          updatedCount++;
        } catch (postError) {
          console.error(`Failed to update post ${post._id}:`, postError);
        }
      }

      console.log(`Updated ${updatedCount} of ${userPosts.length} posts with new user info`);
      return updatedCount;
    } catch (error) {
      console.error('Error updating user info in posts:', error);
      throw error;
    }
  }

  // Add to post_service.ts
  async testUpdatePostUserInfo(postId: string, updatedUserInfo: { name?: string; avatar?: string }) {
    console.log(`Test updating post ${postId} with user info:`, updatedUserInfo);

    try {
      // First get the post
      const post = await this.getPostById(postId);
      console.log('Original post user info:', post.user);

      // Create updated post data
      const updatedPost = {
        ...post,
        user: {
          ...post.user,
          name: updatedUserInfo.name || post.user?.name,
          avatar: updatedUserInfo.avatar || post.user?.avatar,
        },
      };

      console.log('Sending updated post data:', updatedPost);

      // Update the post
      const result = await apiClient.put(`/posts/${postId}`, updatedPost);
      console.log('Update result:', result.data);

      return result.data;
    } catch (error) {
      console.error('Test update failed:', error);
      throw error;
    }
  }

  // async updatePostWithNewUserInfo(postId: string, newUserInfo: { name?: string; avatar?: string }) {
  //   // Step 1: Get the current post
  //   const post = await this.getPostById(postId);

  //   // Step 2: Delete the current post
  //   await this.deletePost(postId);

  //   // Step 3: Merge the updated user info
  //   const updatedUserInfo = {
  //     ...post.user,
  //     name: newUserInfo.name || post.user?.name,
  //     avatar: newUserInfo.avatar || post.user?.avatar,
  //   };

  //   // Step 4: Create a new post with updated info
  //   const newPostData = {
  //     ...post,
  //     user: updatedUserInfo,
  //     // Make sure these are properly formatted for creating a new post
  //     startDate: post.startDate ? new Date(post.startDate).toISOString() : new Date().toISOString(),
  //     endDate: post.endDate ? new Date(post.endDate).toISOString() : new Date().toISOString(),
  //   };

  //   // Step 5: Create the new post - use the post's title as name or fallback to user's name
  //   const createPostData: CreatePostData = {
  //     name: post.title || updatedUserInfo.name || '',
  //     description: post.description,
  //     startDate: newPostData.startDate,
  //     endDate: newPostData.endDate,
  //     price: post.price || 0,
  //     maxSeats: post.maxSeats || 0,
  //     bookedSeats: post.bookedSeats || 0,
  //     image: post.image || '',
  //   };

  //   return await this.createPost(createPostData);
  // }

  async updatePostWithNewUserInfo(postId: string, newUserInfo: { name?: string; avatar?: string }) {
    // Step 1: Get the current post
    const post = await this.getPostById(postId);
    console.log('Current post before update:', post);

    // Step 2: Delete the current post
    await this.deletePost(postId);

    // Step 3: Merge the updated user info
    // IMPORTANT: Explicit handling for avatar - make sure we're using the new value
    const updatedUserInfo = {
      ...post.user,
      name: newUserInfo.name !== undefined ? newUserInfo.name : post.user?.name,
      // Explicitly check for avatar updates and use the new value
      avatar: newUserInfo.avatar !== undefined ? newUserInfo.avatar : post.user?.avatar,
    };

    console.log('Updated user info for post:', updatedUserInfo);

    // Step 4: Create a new post with updated info
    const newPostData = {
      ...post,
      user: updatedUserInfo,
      // Make sure these are properly formatted for creating a new post
      startDate: post.startDate ? new Date(post.startDate).toISOString() : new Date().toISOString(),
      endDate: post.endDate ? new Date(post.endDate).toISOString() : new Date().toISOString(),
    };

    console.log('New post data being created:', newPostData);

    // Step 5: Create the new post - transform to match CreatePostData interface
    const createPostData: CreatePostData = {
      name: post.title || updatedUserInfo.name || '',
      description: post.description,
      startDate: newPostData.startDate,
      endDate: newPostData.endDate,
      price: post.price || 0,
      maxSeats: post.maxSeats || 0,
      bookedSeats: post.bookedSeats || 0,
      image: post.image || '',
    };

    const newPost = await this.createPost(createPostData);
    console.log('New post created with updated avatar:', newPost);
    return newPost;
  }

  // Add this function to src/services/post_service.ts
  async updateUserAvatarInPosts(userId: string, newAvatar: string) {
    console.log(`Updating avatar to ${newAvatar} in all posts for user ${userId}`);

    try {
      // Get all posts by this user
      const posts = await this.getByUserId(userId);
      console.log(`Found ${posts.length} posts to update`);

      // Track successes and failures
      let successCount = 0;
      let failCount = 0;

      // Process each post individually
      for (const post of posts) {
        try {
          console.log(`Updating post ${post._id} with new avatar`);

          // Skip if post has no user object or is already updated
          if (!post.user) {
            console.log(`Skipping post ${post._id} - no user info`);
            continue;
          }

          if (post.user.avatar === newAvatar) {
            console.log(`Skipping post ${post._id} - avatar already updated`);
            continue;
          }

          // Create updated post data with new avatar
          const updatedPost = {
            ...post,
            user: {
              ...post.user,
              avatar: newAvatar,
            },
          };

          // Update the post
          await this.updatePost(post._id, updatedPost);
          successCount++;
        } catch (postError) {
          console.error(`Error updating post ${post._id}:`, postError);
          failCount++;
        }
      }

      console.log(`Updated ${successCount} posts with new avatar (${failCount} failed)`);
      return true;
    } catch (error) {
      console.error('Error updating posts with new avatar:', error);
      return false;
    }
  }
}

export default new PostService();
