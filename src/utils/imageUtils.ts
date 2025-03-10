// In your imageUtils.ts file
// src/utils/imageUtils.ts - improved getImageUrl function
import apiClient from '../services/api-client';

export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/api/placeholder/200/200';

  // If it's already a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get base URL
  const baseURL = apiClient.defaults.baseURL || 'http://localhost:3060';

  // Handle various path formats
  let cleanPath = imagePath;
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.substring(7);
  }

  // Ensure the path starts with /uploads/
  if (!cleanPath.startsWith('/uploads/') && !cleanPath.startsWith('uploads/')) {
    cleanPath = 'uploads/' + cleanPath;
  }

  // Remove any double slashes
  cleanPath = cleanPath.replace(/\/+/g, '/');
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }

  // Extract just the filename for simplicity
  const parts = cleanPath.split('/');
  const filename = parts[parts.length - 1];

  // Encode the filename to handle special characters
  const encodedFilename = encodeURIComponent(filename);

  return `${baseURL}/uploads/${encodedFilename}`;
};
