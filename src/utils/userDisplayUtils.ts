// src/utils/userDisplayUtils.ts

/**
 * Gets the display name for a user based on available user data
 * Always prioritizes the username/nickname over email
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
 * Gets a user's initials based on their name
 * Useful for avatar placeholders
 *
 * @param user User object or null
 * @returns The user's initials (1-2 characters)
 */
export const getUserInitials = (
  user:
    | {
        name?: string;
        email?: string;
      }
    | null
    | undefined
): string => {
  if (!user) return 'U';

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
