// src/services/file_upload_service.ts
import apiClient from './api-client';

//interface UploadResponse {
//  url: string;
//  success: boolean;
//}

class FileUploadService {
  /**
   * Upload a file to the server
   * @param file The file to upload
   * @returns A promise that resolves to the uploaded file URL
   */
  async uploadFile(file: File): Promise<string> {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log('Uploading file:', file.name);

      // Make the POST request to the server
      const response = await apiClient.post('/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);

      // Return the URL of the uploaded file
      if (response.data && response.data.url) {
        // Make sure the URL is properly formatted
        let url = response.data.url;

        // Clean up the path to ensure it works correctly
        if (url.includes('/uploads/')) {
          // Extract the filename only if it's a full path
          const parts = url.split('/');
          const filename = parts[parts.length - 1];
          url = `/uploads/${filename}`;
        } else if (!url.startsWith('http') && !url.startsWith('/uploads/')) {
          url = `/uploads/${url.replace('public/uploads/', '')}`;
        }

        console.log('Cleaned up image URL:', url);
        return url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get the full URL for an image path
   * @param imagePath The path or URL of the image
   * @returns The full URL to access the image
   */
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/api/placeholder/800/600';

    if (imagePath.startsWith('http')) return imagePath;

    // Clean up the path to ensure it's properly formatted
    const cleanPath = imagePath.replace('public/uploads/', '').replace('/uploads/', '');

    return `/uploads/${cleanPath}`;
  }
}

export default new FileUploadService();
