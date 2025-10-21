// User Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  createdAt: Date | null;
  lastSeen: Date | null;
  isOnline: boolean;
}

// Message Status Types
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

// Message Type
export type MessageType = 'text' | 'image';

// Message Interface
export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  type: MessageType;
  imageUrl?: string;
  readBy?: { [userId: string]: Date };
}

// Conversation Type
export type ConversationType = 'dm' | 'group';

// Conversation Interface
export interface Conversation {
  id: string;
  type: ConversationType;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
  // Group-specific fields
  groupName?: string;
  groupIcon?: string;
  adminIds?: string[];
}

// Group Interface
export interface Group {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  adminIds: string[];
  memberIds: string[];
  createdAt: Date;
  createdBy: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Chat Context Types
export interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, type?: MessageType) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
}

// Network Status Types
export interface NetworkContextType {
  isConnected: boolean;
  networkType: string | null;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  ConversationList: undefined;
  Chat: { conversationId: string; conversation?: Conversation };
  NewChat: undefined;
  Profile: undefined;
  UserDetails: { userId: string };
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
};

