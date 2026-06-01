export * from './ai';

// View modes for the application
export type ViewMode = 'list' | 'map' | 'detail' | 'editor' | 'orders' | 'favorites' | 'reviews';

// Chat modes for AI search
export type ChatMode = 'search' | 'inquiry';

// Message types for chat
export type MessageType = 'user' | 'ai' | 'system';

// Order status types
export type OrderStatus = 'inquiry' | 'accepted' | 'inProgress' | 'ready';

// Order interface
export interface Order {
  id: string;
  cakeImage: string;
  shopName?: string;
  status: OrderStatus;
  pickupDate?: string;
  pickupTime?: string;
  lettering?: string;
  createdAt: Date;
}

// Favorite cake interface
export interface FavoriteCake {
  id: string;
  image: string;
  shopName: string;
  description?: string;
  price?: string;
}

// Review interface
export interface Review {
  id: string;
  cakeImage: string;
  shopName: string;
  rating: number;
  comment: string;
  images?: string[];
  date: string;
  orderInfo?: string;
}

// Cake data interface
export interface Cake {
  id: number;
  image: string;
  shopName: string;
  likes: number;
  rating: number;
  tag: string;
  categories: string[];
}

// Chat message interface
export interface Message {
  type: MessageType;
  text: string;
  images?: string[];
  cakeDetails?: { image: string, shopName: string }[];
  options?: string[];
  messageId?: string;
  viewMode?: 'slider' | 'grid'; // Added for image display options
  actionType?: string;
  slots?: any;
  totalPrice?: number;
}

// Conversation state for AI chat
export interface ConversationState {
  region?: string;
  size?: string;
  design?: string;
  selectedCakeImage?: string;
  shopName?: string;
  pickupDate?: string;
  pickupTime?: string;
  lettering?: string;
  allergies?: string;
  additionalRequests?: string;
}

// Inquiry mode interface
export interface InquiryMode {
  active: boolean;
  image: string;
  region?: string;
  size?: string;
  design?: string;
  shopName?: string;
}

// Selected cake interface
export interface SelectedCake {
  image: string;
  shopName: string;
}

// Order data for inquiry completion
export interface OrderData {
  cakeImage: string;
  shopName?: string;
  pickupDate?: string;
  pickupTime?: string;
  lettering?: string;
}

// User interface for authentication
export interface User {
  id: string;
  email: string;
  nickname: string;
  phoneNumber: string;
  language: string;
  profileImage?: string;
}

// --- API Response Types ---

export interface FeedItem {
  id: number;
  imageUrl: string;
  storeName: string;
  tags: string[];
  likeCount: number;
  isInpaintingAllowed: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any[];
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  size: number;
  number: number;
  sort: any[];
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface OrderSchemaTemplate {
  name: string;
  type: string;
  label: string;
  options?: string[];
  required: boolean;
}

export interface OrderSchema {
  templates: OrderSchemaTemplate[];
}

export interface StorePortfolio {
  id: number;
  imageUrl: string;
  tags: string[];
  isInpaintingAllowed: boolean;
  likeCount: number;
}

export interface StoreCategory {
  id: number;
  name: string;
  price: number;
  description: string;
  orderSchema: OrderSchema;
  portfolios: StorePortfolio[];
}

export interface Store {
  id: number;
  name: string;
  description: string;
  hours: string | null;
  notice: string | null;
  cautionNotice: string | null;
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  categories: StoreCategory[];
}


// --- Direct Chat Types ---
export interface DirectChatRoom {
  roomNumber: number;
  memberId: number;
  storeId: number;
  storeName: string;
  createdAt: string;
}

export interface DirectChatMessage {
  roomNumber: number;
  senderType: 'USER' | 'STORE';
  senderId: number;
  content: string;
  timestamp: string;
}
