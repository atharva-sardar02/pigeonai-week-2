// App-wide constants

// Colors
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  // Message bubble colors
  sentBubble: '#007AFF',
  receivedBubble: '#E5E5EA',
  sentText: '#FFFFFF',
  receivedText: '#000000',
};

// Sizes
export const SIZES = {
  // Font sizes
  fontSmall: 12,
  fontMedium: 16,
  fontLarge: 20,
  fontExtraLarge: 24,
  // Spacing
  paddingSmall: 8,
  paddingMedium: 16,
  paddingLarge: 24,
  // Border radius
  borderRadiusSmall: 8,
  borderRadiusMedium: 12,
  borderRadiusLarge: 16,
  // Avatar sizes
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 64,
};

// Firebase Collection Names
export const COLLECTIONS = {
  users: 'users',
  conversations: 'conversations',
  messages: 'messages',
  groups: 'groups',
  typing: 'typing',
};

// Message Limits
export const MESSAGE_LIMITS = {
  maxLength: 10000,
  initialLoadCount: 50,
  loadMoreCount: 20,
};

// Time Constants (in milliseconds)
export const TIME = {
  typingIndicatorTimeout: 3000, // 3 seconds
  messageRetryDelay: 2000, // 2 seconds
  presenceUpdateInterval: 60000, // 1 minute
};

// Validation Rules
export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 5,
    maxLength: 100,
  },
  password: {
    minLength: 6,
    maxLength: 100,
  },
  displayName: {
    minLength: 2,
    maxLength: 50,
  },
  groupName: {
    minLength: 2,
    maxLength: 100,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  auth: {
    invalidEmail: 'Please enter a valid email address',
    weakPassword: 'Password must be at least 6 characters',
    emailInUse: 'This email is already registered',
    userNotFound: 'No account found with this email',
    wrongPassword: 'Incorrect password',
    tooManyRequests: 'Too many failed attempts. Please try again later',
  },
  network: {
    offline: "You're offline. Messages will send when reconnected",
    connectionLost: 'Connection lost. Reconnecting...',
    timeout: 'Request timed out. Please try again',
  },
  message: {
    sendFailed: 'Failed to send message',
    loadFailed: 'Failed to load messages',
    tooLong: `Message cannot exceed ${MESSAGE_LIMITS.maxLength} characters`,
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  auth: {
    signUpSuccess: 'Account created successfully!',
    passwordResetSent: 'Password reset email sent',
    profileUpdated: 'Profile updated successfully',
  },
  message: {
    sent: 'Message sent',
    delivered: 'Delivered',
    read: 'Read',
  },
};

// Date Format Strings
export const DATE_FORMATS = {
  justNow: 'Just now',
  minutesAgo: (minutes: number) => `${minutes}m ago`,
  hoursAgo: (hours: number) => `${hours}h ago`,
  yesterday: 'Yesterday',
  dateFormat: 'MMM DD', // e.g., "Jan 15"
  fullDateFormat: 'MMM DD, YYYY', // e.g., "Jan 15, 2025"
  timeFormat: 'h:mm A', // e.g., "2:30 PM"
};

