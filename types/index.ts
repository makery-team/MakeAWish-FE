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
  options?: string[];
  messageId?: string;
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
