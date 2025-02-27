// import apiClient from './api-client';
// import { GeneratedTrip, SavedTrip } from '../types';

// class TripService {
//   async saveTrip(tripData: GeneratedTrip) {
//     try {
//       const response = await apiClient.post<SavedTrip>('/trips', tripData);
//       return response.data;
//     } catch (error) {
//       console.error('Error saving trip:', error);
//       throw error;
//     }
//   }
//   async getUserTrips() {
//     try {
//       const response = await apiClient.get<SavedTrip[]>('/trips/user');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching user trips:', error);
//       throw error;
//     }
//   }

//   async getAllTrips() {
//     try {
//       const response = await apiClient.get<SavedTrip[]>('/trips');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching trips:', error);
//       throw error;
//     }
//   }
//   // getByUserId(userId: string) {
//   //   return apiClient.get<Post[]>(`/posts?userId=${userId}`).then((res) => res.data);
//   // }
//   async getTripById(id: string) {
//     try {
//       const response = await apiClient.get<SavedTrip>(`/trips?userId=${id}`);
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching trip:', error);
//       throw error;
//     }
//   }

//   async deleteTripById(id: string) {
//     try {
//       await apiClient.delete(`/trips/${id}`);
//     } catch (error) {
//       console.error('Error deleting trip:', error);
//       throw error;
//     }
//   }
// }

// export default new TripService();
import apiClient from './api-client';
import { Trip, SavedTrip, GeneratedTrip } from '../types';

// export interface Trip {
//   _id: string;
//   title: string;
//   location: string;
//   user: {
//     _id: string;
//     email: string;
//     avatar?: string;
//   };
//   text?: string;
//   image?: string;
//   latitude?: number;
//   longitude?: number;
//   likes: number;
//   createdAt: string;
//   comments: {
//     user: string;
//     text: string;
//     createdAt: string;
//   }[];
// }

class TripService {
  async saveTrip(tripData: GeneratedTrip): Promise<SavedTrip> {
    try {
      const response = await apiClient.post<SavedTrip>('/trips', tripData);
      return response.data;
    } catch (error) {
      console.error('Error saving trip:', error);
      throw error;
    }
  }

  getAll(userId?: string) {
    const url = userId ? `/trips?userId=${userId}` : '/trips';
    return apiClient.get<Trip[]>(url).then((res) => res.data);
  }

  async createPost(postData: { name: string; description: string; startDate: string; endDate: string; price: number; maxSeats: number; image?: string }) {
    console.log('Creating post with data:', postData);
    try {
      const response = await apiClient.post('/trips', {
        name: postData.name,
        description: postData.description,
        startDate: postData.startDate,
        endDate: postData.endDate,
        price: postData.price,
        maxSeats: postData.maxSeats,
        bookedSeats: 0,
        image: postData.image,
        comments: [],
        likes: [],
      });
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  likePost(postId: string) {
    return apiClient.post(`/trips/${postId}/like`);
  }

  addComment(postId: string, text: string) {
    return apiClient.post(`/trips/${postId}/comment`, { text });
  }

  getByUserId(userId: string) {
    return apiClient.get<Trip[]>(`/trips?userId=${userId}`).then((res) => res.data);
  }

  async uploadImage(formData: FormData) {
    try {
      const response = await apiClient.post('/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  deletePost(postId: string) {
    return apiClient.delete(`/trips/${postId}`);
  }
}

export default new TripService();
