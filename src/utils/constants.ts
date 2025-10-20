// App-wide constants

// Colors (Dark Mode Theme - Matching Pigeon Icon)
export const COLORS = {
  // Primary Brand Colors (Matching the pigeon icon gradient)
  primary: '#4A9FF5',        // Bright blue from pigeon
  primaryDark: '#2563EB',    // Darker blue from pigeon
  primaryLight: '#60C5F5',   // Light cyan blue from pigeon
  secondary: '#5856D6',
  
  // Status Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#4A9FF5',               // Matching pigeon blue
  
  // Background Colors (Dark Mode)
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',
  
  // Text Colors (Dark Mode)
  text: '#FFFFFF',
  textSecondary: '#A1A1A6',
  textTertiary: '#636366',
  textPlaceholder: '#48484A',
  
  // Border Colors
  border: '#38383A',
  borderLight: '#48484A',
  borderFocus: '#4A9FF5',        // Matching pigeon blue
  
  // Input Colors
  inputBackground: '#1C1C1E',
  inputBorder: '#38383A',
  inputFocus: '#4A9FF5',         // Matching pigeon blue
  inputText: '#FFFFFF',
  inputPlaceholder: '#8E8E93',
  
  // Button Colors
  buttonPrimary: '#4A9FF5',      // Matching pigeon blue
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#2C2C2E',
  buttonSecondaryText: '#4A9FF5', // Matching pigeon blue
  buttonDisabled: '#3A3A3C',
  buttonDisabledText: '#636366',
  
  // Message bubble colors
  sentBubble: '#4A9FF5',         // Matching pigeon blue
  receivedBubble: '#2C2C2E',
  sentText: '#FFFFFF',
  receivedText: '#FFFFFF',
  
  // Status Indicators
  online: '#34C759',
  offline: '#8E8E93',
  typing: '#4A9FF5',             // Matching pigeon blue
  
  // Card/Surface Colors
  card: '#1C1C1E',
  cardHover: '#2C2C2E',
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

// Additional UI constants updated for dark mode
export const THEME = {
  mode: 'dark',
  name: 'Pigeon Dark',
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

