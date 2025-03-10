// src/utils/imageUtils.ts
export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/api/placeholder/200/200';
  const cleanPath = imagePath.replace('public/uploads/', '');
  return `${'http://localhost:3060'}/uploads/${cleanPath}`;
};
