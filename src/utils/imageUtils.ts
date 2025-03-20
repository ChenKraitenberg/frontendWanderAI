// src/utils/imageUtils.ts
import apiClient from '../services/api-client';

/**
 * Unified solution for image URLs that works consistently across the application
 * Handles all image types including user avatars, post images, and placeholders
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  // Return default placeholder if no image path provided
  if (!imagePath) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e0e0e0"/%3E%3C/svg%3E';
  }

  // If it's already a data URL (base64 encoded image), return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseURL = apiClient.defaults.baseURL || 'https://node113.cs.colman.ac.il';


  // If the image path is already an absolute URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get the base URL from the API client configuration
 // const baseURL = apiClient.defaults.baseURL || 'http://localhost:3060';

  // Normalize the path - extract just the filename
  let filename = imagePath;

  // Handle various path formats by extracting just the filename
  if (imagePath.includes('/')) {
    const parts = imagePath.split('/');
    filename = parts[parts.length - 1];
  }

  // Remove any path prefixes that might be there
  filename = filename.replace('public/uploads/', '').replace('uploads/', '').replace('/uploads/', '');

  // Always prepend with /uploads/ for consistency
  return `${baseURL}/uploads/${encodeURIComponent(filename)}`;
};

export const getProfileImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e0e0e0"/%3E%3C/svg%3E';
  }
  // Get base URL using the existing function
  const baseUrl = getImageUrl(imagePath);
  
  // Add cache busting parameter for non-data URLs
  if (!baseUrl.startsWith('data:')) {
    // Add timestamp to force browser to reload the image
    return `${baseUrl}?t=${Date.now()}`;
  }
  
  return baseUrl;
};


/**
 * Debug helper to trace avatar resolution
 */
export const debugImageUrl = (imagePath: string | null | undefined, context: string): string => {
  console.log(`[DEBUG] getImageUrl in ${context}:`, {
    input: imagePath?.substring(0, 50) + (imagePath && imagePath.length > 50 ? '...' : ''),
    type: !imagePath ? 'null/undefined' : imagePath.startsWith('data:') ? 'data URL' : imagePath.startsWith('http') ? 'absolute URL' : 'relative path',
  });

  const result = getImageUrl(imagePath);
  console.log(`[DEBUG] getImageUrl result:`, result.substring(0, 50) + '...');

  return result;
};
