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
  cakeDetails?: { 
    image: string, 
    shopName: string, 
    portfolioId?: number, 
    storeId?: number, 
    productId?: number,
    tags?: string[]
  }[];
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
  portfolioId?: number;
  storeId?: number;
  productId?: number;
  tags?: string[];
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
  portfolioId?: number;
  storeId?: number;
  productId?: number;
  tags?: string[];
}

// Selected cake interface
export interface SelectedCake {
  image: string;
  shopName: string;
  portfolioId?: number;
  storeId?: number;
  productId?: number;
}

// Order data for inquiry completion
export interface OrderData {
  [key: string]: any; // Allow dynamic Korean keys from AI schema
  cakeImage: string;
  shopName?: string;
  portfolioId?: number;
  storeId?: number;
  productId?: number;
  pickupDate?: string;
  pickupTime?: string;
  lettering?: string;
  flavor?: string;
  size?: string;
  design?: string;
  additionalRequests?: string;
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
  storeId?: number;
  productId?: number;
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
  address?: string;
  thumbnailUrl?: string;
  categories: StoreCategory[];
}

export interface MapStore {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  thumbnailUrl?: string;
  rating: number;
  reviewCount: number;
  tags: string[];
}

export interface StoreReview {
  id: number;
  nickname: string;
  rating: number;
  content: string;
  imageUrls: string[];
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  portfolioId?: number;
  customizedImageUrl?: string;
}

export interface OrderCreateRequest {
  storeId: number;
  pickupDate: string;
  orderData?: Record<string, string>;
  items: OrderItemRequest[];
}

// --- Direct Chat Types ---
export interface DirectChatMessage {
  userId: number;
  message: string;
  imageUrl: string | null;
  roomNumber: number;
  createdTime: string;
}

export interface DirectChatRoom {
  roomNumber: number;
  userId: number;
  otherId: number;
  messages: DirectChatMessage[];
}

// --- Notification Types ---
export interface AppNotification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  content: AppNotification[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  first: boolean;
  last: boolean;
  hasNext: boolean;
}

// --- Order History Types ---
export type BackendOrderStatus = "PENDING_QUOTE" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export interface OrderListItem {
  id: number;
  orderNumber: string;
  storeName: string;
  status: BackendOrderStatus;
  totalPrice: number;
  pickupDate: string;
  createdAt: string;
}

export interface OrderItemDetail {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  customizedImageUrl: string;
}

export interface OrderDetail extends OrderListItem {
  orderData: Record<string, string>;
  items: OrderItemDetail[];
}
