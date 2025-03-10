// src/utils/imageUtils.ts
export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/api/placeholder/200/200';

if(imagePath.startsWith('http')) return imagePath;

const cleanPath = imagePath.replace('public/uploads/', '').replace('/uploads/', '');

return `/uploads/${cleanPath}`;
};
