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
  userId?: string;
}

class WishlistService {
    private readonly STORAGE_KEY_PREFIX = 'travel_app_wishlist_';


  // Get all wishlist items
  private getUserStorageKey(): string {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('No user ID found in localStorage, using default key');
      return this.STORAGE_KEY_PREFIX + 'anonymous';
    }
    return this.STORAGE_KEY_PREFIX + userId;
  }

   // Get all wishlist items for the current user
   getWishlistItems = (): WishlistItem[] => {
    try {
      const storageKey = this.getUserStorageKey();
      const wishlistJson = localStorage.getItem(storageKey);
      console.log(`Fetching wishlist items for user with storage key: ${storageKey}`);
      
      if (!wishlistJson) return [];
      return JSON.parse(wishlistJson);
    } catch (error) {
      console.error('Error fetching wishlist items from localStorage:', error);
      return [];
    }
  };


  
  // Add an item to wishlist for the current user
  addToWishlist = (tripData: GeneratedPost): WishlistItem => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.warn('No user ID found when adding to wishlist');
      }
      
      // Create new wishlist item
      const newItem: WishlistItem = {
        id: `wish_${Date.now()}`,
        title: tripData.title,
        description: tripData.description,
        destination: tripData.destination,
        duration: tripData.duration,
        category: tripData.category,
        itinerary: tripData.itinerary,
        createdAt: new Date().toISOString(),
        userId: userId || undefined // Store the userId with the item
      };

      // Get current items for this user and add the new one
      const storageKey = this.getUserStorageKey();
      const currentItems = this.getWishlistItems();
      const updatedItems = [...currentItems, newItem];

      console.log(`Adding new item to wishlist for user with storage key: ${storageKey}`);
      
      // Save back to localStorage with user-specific key
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
      
      return newItem;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  // Remove an item from wishlist for the current user
  removeFromWishlist = (itemId: string): void => {
    try {
      const storageKey = this.getUserStorageKey();
      const currentItems = this.getWishlistItems();
      const updatedItems = currentItems.filter(item => item.id !== itemId);
      
      console.log(`Removing item ${itemId} from wishlist for storage key: ${storageKey}`);
      
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };
}

export default new WishlistService();