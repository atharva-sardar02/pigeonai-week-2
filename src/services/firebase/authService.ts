import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
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

    return user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign up');
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send password reset email');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  displayName?: string,
  photoURL?: string
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL,
    });

    // Update Firestore document
    await setDoc(
      doc(db, 'users', user.uid),
      {
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL,
      },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

