import { User } from '../types';

/**
 * User Model
 * 
 * Represents a user in the Pigeon AI application.
 * Includes helper functions for user operations and validation.
 */

/**
 * Creates a new User object with default values
 */
export const createUser = (
  uid: string,
  email: string,
  displayName: string | null = null,
  photoURL: string | null = null
): User => {
  return {
    uid,
    email,
    displayName,
    photoURL,
    bio: '',
    createdAt: new Date(),
    lastSeen: new Date(),
    isOnline: true,
  };
};

/**
 * Converts Firestore document to User object
 * Handles Firestore Timestamp conversion
 */
export const fromFirestore = (data: any, uid: string): User => {
  return {
    uid,
    email: data.email || null,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    bio: data.bio || '',
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    lastSeen: data.lastSeen?.toDate ? data.lastSeen.toDate() : new Date(),
    isOnline: data.isOnline || false,
  };
};

/**
 * Converts User object to Firestore document format
 * Removes uid (as it's stored as document ID)
 */
export const toFirestore = (user: User): any => {
  return {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    bio: user.bio || '',
    createdAt: user.createdAt,
    lastSeen: user.lastSeen,
    isOnline: user.isOnline,
  };
};

/**
 * Updates the user's online status
 */
export const updateOnlineStatus = (user: User, isOnline: boolean): User => {
  return {
    ...user,
    isOnline,
    lastSeen: new Date(),
  };
};

/**
 * Updates the user's profile information
 */
export const updateProfile = (
  user: User,
  updates: {
    displayName?: string | null;
    photoURL?: string | null;
    bio?: string;
  }
): User => {
  return {
    ...user,
    ...updates,
  };
};

/**
 * Validates if a user object has required fields
 */
export const isValidUser = (user: any): user is User => {
  return (
    user &&
    typeof user.uid === 'string' &&
    user.uid.length > 0 &&
    (user.email === null || typeof user.email === 'string')
  );
};

/**
 * Gets user display name with fallback
 * Returns email prefix if displayName is not set
 */
export const getDisplayName = (user: User): string => {
  if (user.displayName) {
    return user.displayName;
  }
  
  if (user.email) {
    // Return email prefix (before @) as fallback
    return user.email.split('@')[0];
  }
  
  return 'Unknown User';
};

/**
 * Gets user initials for avatar placeholder
 * Returns first 2 letters of display name
 */
export const getUserInitials = (user: User): string => {
  const displayName = getDisplayName(user);
  
  const words = displayName.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return displayName.substring(0, 2).toUpperCase();
};

/**
 * Formats the last seen time
 * Returns human-readable string like "2 minutes ago", "Active now"
 */
export const formatLastSeen = (user: User): string => {
  if (user.isOnline) {
    return 'Active now';
  }
  
  if (!user.lastSeen) {
    return 'Offline';
  }
  
  const now = new Date().getTime();
  const lastSeen = user.lastSeen.getTime();
  const diffMs = now - lastSeen;
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return 'Last seen a while ago';
  }
};

/**
 * Checks if user profile is complete
 * (has displayName and email)
 */
export const isProfileComplete = (user: User): boolean => {
  return !!(user.displayName && user.email);
};

/**
 * Creates a minimal user representation for Firestore queries
 * Used for efficient data transfer
 */
export const toUserSummary = (user: User) => {
  return {
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isOnline: user.isOnline,
  };
};

// Export the User type for convenience
export type { User };

