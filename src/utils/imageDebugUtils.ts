// src/utils/imageDebugUtils.ts
import apiClient from '../services/api-client';

/**
 * Utility to help debug image loading issues
 * Add this to any component to log detailed image information
 */
export const debugImagePath = (imagePath: string, componentName: string = 'Unknown') => {
  if (!imagePath) {
    console.log(`[${componentName}] Image path is empty or null`);
    return;
  }

  console.log(`[${componentName}] Original image path:`, imagePath);

  // Get the base URL from the API client
  const baseURL = apiClient.defaults.baseURL || 'http://localhost:3060';
  console.log(`[${componentName}] API base URL:`, baseURL);

  // Check if it's already an absolute URL
  if (imagePath.startsWith('http')) {
    console.log(`[${componentName}] Image is already an absolute URL`);
    return;
  }

  // Log various path transformations for debugging
  let processedPath = imagePath;

  if (processedPath.startsWith('public/')) {
    processedPath = processedPath.substring(7);
    console.log(`[${componentName}] After removing 'public/' prefix:`, processedPath);
  }

  if (processedPath.startsWith('uploads/')) {
    processedPath = processedPath.substring(8);
    console.log(`[${componentName}] After removing 'uploads/' prefix:`, processedPath);
  }

  // Extract filename
  const parts = processedPath.split('/');
  const filename = parts[parts.length - 1];
  console.log(`[${componentName}] Extracted filename:`, filename);

  // Show encoded filename
  const encodedFilename = encodeURIComponent(filename);
  console.log(`[${componentName}] Encoded filename:`, encodedFilename);

  // Show the final URL that would be used
  const finalUrl = `${baseURL}/uploads/${encodedFilename}`;
  console.log(`[${componentName}] Final URL:`, finalUrl);

  // Check for problematic characters
  if (/[^\x00-\x7F]/.test(filename)) {
    console.log(`[${componentName}] ⚠️ Warning: Filename contains non-ASCII characters!`);
  }

  if (filename.includes(' ')) {
    console.log(`[${componentName}] ⚠️ Warning: Filename contains spaces!`);
  }

  // Test if the image is accessible
  const img = new Image();
  img.onload = () => console.log(`[${componentName}] ✅ Image loaded successfully!`);
  img.onerror = () => console.log(`[${componentName}] ❌ Image failed to load!`);
  img.src = finalUrl;
};

/**
 * Add this to a component to test all known image URL formats
 */
export const testImageUrlFormats = () => {
  const testUrls = [
    'public/uploads/image.jpg',
    'uploads/image.jpg',
    '/uploads/image.jpg',
    'image.jpg',
    'public/uploads/file with spaces.jpg',
    'public/uploads/hebrew-שלום.jpg',
    null,
    'http://example.com/test.jpg',
  ];

  console.group('Testing Image URL Formats');
  testUrls.forEach((url) => {
    if (url !== null) {
      debugImagePath(url, 'TestComponent');
    }
  });
  console.groupEnd();
};
