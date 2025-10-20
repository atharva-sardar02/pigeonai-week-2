import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { User } from '../../types';
import { fromFirestore } from '../../models/User';

/**
 * Firebase Auth Service
 * 
 * Handles all authentication operations including:
 * - User signup and signin
 * - Profile management
 * - Password reset
 * - User presence (online/offline status)
 * - Firestore user document sync
 */

/**
 * Convert Firebase Auth error to user-friendly message
 */
const getAuthErrorMessage = (error: any): string => {
  const errorCode = error.code;
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Sign up a new user with email and password
 * Creates both Firebase Auth account and Firestore user document
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      photoURL: null,
      bio: '',
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      isOnline: true,
    });

    // Set up presence system
    await setUserOnlineStatus(user.uid, true);

    return user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};

/**
 * Sign in an existing user
 * Updates user's online status in Firestore
 */
export const signIn = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update user's online status and last seen
    await setUserOnlineStatus(user.uid, true);

    return user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};

/**
 * Sign out the current user
 * Updates user's offline status before signing out
 */
export const signOut = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    // Update user's online status to false before signing out
    if (user) {
      await setUserOnlineStatus(user.uid, false);
    }

    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};

/**
 * Get current Firebase user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Get current user's Firestore document
 * Returns complete user profile with additional fields
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    return fromFirestore(userDoc.data(), uid);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update user profile (display name and/or photo URL)
 */
export const updateUserProfile = async (
  displayName?: string | null,
  photoURL?: string | null
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Prepare update object for Firebase Auth
    const authUpdate: { displayName?: string | null; photoURL?: string | null } = {};
    if (displayName !== undefined) authUpdate.displayName = displayName;
    if (photoURL !== undefined) authUpdate.photoURL = photoURL;

    // Update Firebase Auth profile
    if (Object.keys(authUpdate).length > 0) {
      await updateProfile(user, authUpdate);
    }

    // Prepare update object for Firestore
    const firestoreUpdate: any = {};
    if (displayName !== undefined) firestoreUpdate.displayName = displayName;
    if (photoURL !== undefined) firestoreUpdate.photoURL = photoURL;

    // Update Firestore document
    if (Object.keys(firestoreUpdate).length > 0) {
      await updateDoc(doc(db, 'users', user.uid), firestoreUpdate);
    }
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};

/**
 * Update user bio
 */
export const updateUserBio = async (bio: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await updateDoc(doc(db, 'users', user.uid), { bio });
  } catch (error: any) {
    throw new Error('Failed to update bio');
  }
};

/**
 * Set user online/offline status
 * Also updates lastSeen timestamp
 */
export const setUserOnlineStatus = async (
  uid: string,
  isOnline: boolean
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      isOnline,
      lastSeen: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('Error updating online status:', error);
  }
};

/**
 * Set up presence system for automatic offline status on disconnect
 * Call this after user signs in
 */
export const setupPresence = async (uid: string): Promise<void> => {
  try {
    const userStatusRef = doc(db, 'users', uid);

    // Set user as online
    await updateDoc(userStatusRef, {
      isOnline: true,
      lastSeen: serverTimestamp(),
    });

    // Note: onDisconnect is not available in Firebase JS SDK Web
    // For web apps, we need to handle this differently:
    // 1. Use beforeunload event to set offline status
    // 2. Use visibility change API
    // 3. Or implement periodic heartbeat system
    // This will be handled in the AuthContext
  } catch (error: any) {
    console.error('Error setting up presence:', error);
  }
};

/**
 * Subscribe to auth state changes
 * Returns unsubscribe function
 */
export const onAuthStateChange = (
  callback: (user: FirebaseUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Reload current user data from Firebase
 * Useful after profile updates
 */
export const reloadUser = async (): Promise<void> => {
  const user = auth.currentUser;
  if (user) {
    await user.reload();
  }
};

