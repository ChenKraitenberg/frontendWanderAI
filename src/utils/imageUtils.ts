// src/utils/imageUtils.ts
import apiClient from '../services/api-client';

/**
 * Unified solution for image URLs that works for all image types
 * including Hebrew characters and user avatars
 */
export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/api/placeholder/200/200';

  // If the image path is already an absolute URL, return it as is
  if (imagePath.startsWith('public/')) {
    // Remove the "public/" prefix since the server maps this differently
    imagePath = imagePath.substring(7); // "public/".length === 7
  }

  // Get the base URL from the API client configuration
  const baseURL = apiClient.defaults.baseURL || 'http://localhost:3060';

  // Just extract the filename portion regardless of path format
  let filename = '';

  if (imagePath.includes('/')) {
    // Get the last part after any slash
    const parts = imagePath.split('/');
    filename = parts[parts.length - 1];
  } else {
    filename = imagePath;
  }

  // For certain characters, we need to handle them specially
  filename = encodeURIComponent(filename);

  // Since '/uploads/' is working for Hebrew characters, use it for everything
  return `${baseURL}/uploads/${filename}`;
};
