
import React from 'react';

export interface EBookPage {
  id: string;
  title: string;
  content: string;
  pageNumber: number;
}

export interface EBook {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImageUrl: string;
  genre: string;
  sellerId: string;
  publicationDate: string;
  pages?: EBookPage[]; // Added pages support
  pdfUrl?: string; // Added to support actual PDF uploads
  isDraft?: boolean; // Added draft status
}

export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  amount: number;
  timestamp: string;
  sellerId: string;
  status: 'pending' | 'completed' | 'failed';
  payoutStatus: 'pending' | 'completed';
}

export interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  upiId: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  razorpayPayoutId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  purchaseHistory: EBook[];
  purchasedBookIds: string[]; // Added for fast access control
  wishlist: EBook[];
  isVerified?: boolean; 
  username?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  bio?: string;
}

export type CreatorSiteTheme = 'dark-minimal' | 'light-elegant' | 'tech-vibrant';

export interface CreatorSiteConfig {
  isEnabled: boolean;
  slug: string;
  theme: CreatorSiteTheme;
  profileImageUrl?: string;
  displayName?: string;
  tagline?: string;
  showcasedBookIds: string[]; // IDs of EBooks to display
}

export interface SubscriptionStatus {
  isActive: boolean;
  planId: string;
  startDate: string;
  endDate: string;
  razorpaySubscriptionId?: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  payoutEmail: string; 
  payoutUpiId?: string; 
  uploadedBooks: EBook[];
  creatorSite?: CreatorSiteConfig;
  isVerified?: boolean; 
  isAdmin?: boolean; 
  username?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  payoutHistory?: Payout[]; // Added payout history
  subscription?: SubscriptionStatus; // Added AI subscription status
}

export enum UserType {
  GUEST = 'guest',
  USER = 'user',
  SELLER = 'seller',
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface CartItem extends EBook {
  quantity: number;
}

export interface AppContextType {
  currentUser: User | Seller | null;
  userType: UserType;
  setCurrentUser: (user: User | Seller | null, type: UserType) => void;
  cart: CartItem[];
  addToCart: (book: EBook) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  theme: string; // 'dark' is default
  geminiChat: any;
  initializeChat: () => Promise<void>;
  isChatbotOpen: boolean;
  toggleChatbot: () => void;
  updateSellerCreatorSite: (config: CreatorSiteConfig) => void;
  allBooks: EBook[]; // Added to manage AI-created books dynamically
  addCreatedBook: (book: EBook) => void; // For AI eBook creation
  updateEBook: (book: EBook) => void; // Added for editing eBooks
  handleGoogleLogin: () => Promise<boolean>; // Updated for Firebase SDK
  handleEmailLogin: (email: string, password: string) => Promise<{success: boolean, message?: string}>; // ADDED: Email Login
  upgradeToSeller: () => void; // Upgrade User to Seller
  verifyUser: () => void; // Added for Blue Tick Verification
  isInitialAuthCheck: boolean; 
  isAuthenticating: boolean;
  logout: () => Promise<void>; 
  finalizePurchase: (books: EBook[]) => Promise<void>; // Added for marketplace
  updatePayoutUpi: (upiId: string) => Promise<void>; // Added for payouts
  updateSubscription: (planId: string) => Promise<void>; // Added for AI subscriptions
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

export interface GroundingChunkWeb {
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}
export interface GroundingMetadata {
  searchQuery?: string;
  groundingChunks?: GroundingChunk[];
}

// For AI Generated Cover
export interface GeneratedImage {
  imageBytes: string; // Base64 encoded image
  prompt?: string;
  revisedPrompt?: string;
}

// AI Creation Types
export interface ChapterOutline {
  title: string;
  summary: string;
}

export interface BookOutline {
  title: string;
  chapters: ChapterOutline[];
}

export interface AnalyzedStyle {
  fontPrimary: string;
  fontSecondary: string;
  colorPrimary: string;
  colorSecondary: string;
  colorBackground: string;
  colorText: string;
}

// --- Agentic Workflow Types ---

export type AgentRole = 'planner' | 'writer' | 'designer' | 'reviewer' | 'researcher' | 'idle';

export interface AgentLog {
  id: string;
  agent: AgentRole;
  message: string;
  timestamp: number;
}

export interface AgentTask {
  id: string;
  type: AgentRole;
  status: 'pending' | 'working' | 'completed' | 'failed';
  description: string;
}
