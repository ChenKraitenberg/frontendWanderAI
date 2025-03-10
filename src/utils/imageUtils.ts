// src/utils/imageUtils.ts
import apiClient from '../services/api-client';

/**
 * Unified solution for image URLs that works for all image types
 * including Hebrew characters and user avatars
 */
export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/api/placeholder/200/200';

  if (imagePath.startsWith('http')) return imagePath;

  const cleanPath = imagePath.replace('public/uploads/', '').replace('/uploads/', '');

  return `/uploads/${cleanPath}`;
};
