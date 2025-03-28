import { getImageUrl } from './imageUtils';

/**
 * Gets the display name for a user based on available user data
 * Prioritizes the username/nickname over email
 *
 * @param user User object or null
 * @param fallback Optional fallback string if no name is available
 * @returns The user's display name
 */
export const getUserDisplayName = (user: { name?: string; email?: string } | null | undefined, fallback: string = 'User'): string => {
  if (!user) return fallback;

  // Before checking for name in the user object, check localStorage
  const storedName = localStorage.getItem('userName');
  if (storedName && storedName.trim() !== '') {
    return storedName;
  }

  // Then try the name field from the user object
  if (user.name && user.name.trim() !== '') {
    return user.name;
  }

  // Use email as fallback only if no name is available
  if (user.email) {
    return user.email;
  }

  // Last resort fallback
  return fallback;
};

/**
 * Gets the user's avatar URL with proper fallbacks and consistent formatting
 *
 * @param userObj User object that might contain avatar information
 * @returns A valid URL for the user's avatar image
 */
// export const getUserAvatar = (userObj?: { _id?: string; avatar?: string | null }): string => {
//   // For debugging
//   console.log('getUserAvatar called for user:', {
//     providedUserId: userObj?._id,
//     currentUserId: localStorage.getItem('userId'),
//     hasAvatar: !!userObj?.avatar,
//   });

//   // If this is the current user, check localStorage first
//   const currentUserId = localStorage.getItem('userId');
//   if (userObj?._id === currentUserId) {
//     const localAvatar = localStorage.getItem('userAvatar');
//     if (localAvatar) {
//       return localAvatar;
//     }
//   }

//   // Otherwise, use the provided avatar if it exists
//   if (userObj?.avatar) {
//     return getImageUrl(userObj.avatar);
//   }

//   // Default avatar as fallback
//   return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e0e0e0"/%3E%3C/svg%3E';
// };
export const getUserAvatar = (userObj?: { _id?: string; avatar?: string | null }): string => {
  // Check if this is the current user and use localStorage if available
  const currentUserId = localStorage.getItem('userId');
  if (userObj?._id === currentUserId) {
    const localAvatar = localStorage.getItem('userAvatar');
    if (localAvatar) {
      // For data URLs, return as-is
      if (localAvatar.startsWith('data:')) {
        return localAvatar;
      }
      // For regular URLs, add cache busting
      const cacheBuster = Date.now();
      return `${getImageUrl(localAvatar)}?t=${cacheBuster}`;
    }
  }

  // For the provided avatar, use getImageUrl with cache busting only for non-data URLs
  if (userObj?.avatar) {
    // For data URLs, return as-is
    if (userObj.avatar.startsWith('data:')) {
      return userObj.avatar;
    }
    // For regular URLs, add cache busting
    const cacheBuster = Date.now();
    return `${getImageUrl(userObj.avatar)}?t=${cacheBuster}`;
  }

  // Default avatar
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23e0e0e0"/%3E%3C/svg%3E';
};
/**
 * Gets a user's initials based on their name
 * Useful for avatar placeholders
 *
 * @param user User object or null
 * @returns The user's initials (1-2 characters)
 */
export const getUserInitials = (user: { name?: string; email?: string } | null | undefined): string => {
  if (!user) return 'U';

  // Check localStorage first for current user
  const storedName = localStorage.getItem('userName');
  if (storedName && storedName.trim() !== '') {
    const parts = storedName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    } else {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  }

  // Try to get initials from name
  if (user.name && user.name.trim() !== '') {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length === 1) {
      // Single name - use first letter
      return parts[0].charAt(0).toUpperCase();
    } else {
      // Multiple names - use first letter of first and last name
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
  }

  // Fall back to using the first letter of email
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }

  return 'U';
};
