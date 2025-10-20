import { VALIDATION } from './constants';

/**
 * Validation utility functions
 */

/**
 * Validate email address
 */
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length < VALIDATION.email.minLength) {
    return `Email must be at least ${VALIDATION.email.minLength} characters`;
  }
  
  if (trimmedEmail.length > VALIDATION.email.maxLength) {
    return `Email must be less than ${VALIDATION.email.maxLength} characters`;
  }
  
  if (!VALIDATION.email.pattern.test(trimmedEmail)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password: string): string | null => {
  if (!password || password.length === 0) {
    return 'Password is required';
  }
  
  if (password.length < VALIDATION.password.minLength) {
    return `Password must be at least ${VALIDATION.password.minLength} characters`;
  }
  
  if (password.length > VALIDATION.password.maxLength) {
    return `Password must be less than ${VALIDATION.password.maxLength} characters`;
  }
  
  return null;
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword || confirmPassword.length === 0) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

/**
 * Validate display name
 */
export const validateDisplayName = (displayName: string): string | null => {
  if (!displayName || displayName.trim().length === 0) {
    return 'Display name is required';
  }
  
  const trimmedName = displayName.trim();
  
  if (trimmedName.length < VALIDATION.displayName.minLength) {
    return `Display name must be at least ${VALIDATION.displayName.minLength} characters`;
  }
  
  if (trimmedName.length > VALIDATION.displayName.maxLength) {
    return `Display name must be less than ${VALIDATION.displayName.maxLength} characters`;
  }
  
  return null;
};

/**
 * Validate group name
 */
export const validateGroupName = (groupName: string): string | null => {
  if (!groupName || groupName.trim().length === 0) {
    return 'Group name is required';
  }
  
  const trimmedName = groupName.trim();
  
  if (trimmedName.length < VALIDATION.groupName.minLength) {
    return `Group name must be at least ${VALIDATION.groupName.minLength} characters`;
  }
  
  if (trimmedName.length > VALIDATION.groupName.maxLength) {
    return `Group name must be less than ${VALIDATION.groupName.maxLength} characters`;
  }
  
  return null;
};

