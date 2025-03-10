// For simplicity, let's consider using localStorage temporarily to store wishlist items
// This approach will work without backend changes as a quick solution

// src/services/wishlist_service.ts
import { GeneratedPost } from '../types';

export interface WishlistItem {
  id: string;
  title: string;
  description: string;
  destination: string;
  duration: string;
  category: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
  itinerary?: string[];
  createdAt: string;
  image?: string;
}

class WishlistService {
  private readonly STORAGE_KEY = 'travel_app_wishlist';

  // Get all wishlist items
  getWishlistItems = (): WishlistItem[] => {
    try {
      const wishlistJson = localStorage.getItem(this.STORAGE_KEY);
      if (!wishlistJson) return [];
      return JSON.parse(wishlistJson);
    } catch (error) {
      console.error('Error fetching wishlist items from localStorage:', error);
      return [];
    }
  };

  // Add an item to wishlist
  addToWishlist = (tripData: GeneratedPost): WishlistItem => {
    try {
      // Create new wishlist item
      const newItem: WishlistItem = {
        id: `wish_${Date.now()}`,
        title: tripData.title,
        description: tripData.description,
        destination: tripData.destination,
        duration: tripData.duration,
        category: tripData.category,
        itinerary: tripData.itinerary,
        image: tripData.imageUrl,
        createdAt: new Date().toISOString()
      };

      // Get current items and add the new one
      const currentItems = this.getWishlistItems();
      const updatedItems = [...currentItems, newItem];

      // Save back to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedItems));
      
      return newItem;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  // Remove an item from wishlist
  removeFromWishlist = (itemId: string): void => {
    try {
      const currentItems = this.getWishlistItems();
      const updatedItems = currentItems.filter(item => item.id !== itemId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };
}

export default new WishlistService();