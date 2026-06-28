import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoriteService } from '@/services/favorite';
import { reviewService } from '@/services/review';
import type { Order, FavoriteCake, Review, OrderData } from '@/types';

interface ShopContextType {
  orders: Order[];
  favorites: FavoriteCake[];
  reviews: Review[];
  addOrder: (orderData: OrderData) => Order;
  removeOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  toggleFavorite: (cakeId: number, image: string, shopName: string, tag?: string) => void;
  removeFavorite: (cakeId: string) => void;
  isFavorited: (cakeId: number) => boolean;
  deleteReview: (reviewId: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<FavoriteCake[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]); // Initialized with empty for now

  // Load initial favorites (Cache + Backend Sync)
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // 1. Load from AsyncStorage for immediate UI (Cache)
        const cached = await AsyncStorage.getItem('@favorites_cache');
        if (cached) {
          setFavorites(JSON.parse(cached));
        }
        
        // 2. Fetch from backend and sync
        const backendFavorites = await favoriteService.getMyFavorites();
        setFavorites(backendFavorites);
        await AsyncStorage.setItem('@favorites_cache', JSON.stringify(backendFavorites));
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };

    const loadReviews = async () => {
      try {
        // 1. Load from AsyncStorage (Cache)
        const cached = await AsyncStorage.getItem('@reviews_cache');
        if (cached) {
          setReviews(JSON.parse(cached));
        }

        // 2. Fetch from backend and sync
        const backendReviews = await reviewService.getMyReviews(0, 50); // Get recent 50 reviews
        
        // Map ReviewResponse to frontend Review type
        const mappedReviews: Review[] = backendReviews.content.map(res => ({
          id: res.id.toString(),
          cakeImage: res.imageUrl || '',
          shopName: res.storeName || 'MakeAWish 샵',
          rating: res.rating,
          comment: res.content,
          date: new Date(res.createdAt).toLocaleDateString(),
          images: res.imageUrl ? [res.imageUrl] : [],
        }));

        setReviews(mappedReviews);
        await AsyncStorage.setItem('@reviews_cache', JSON.stringify(mappedReviews));
      } catch (error) {
        console.error('Failed to load reviews:', error);
      }
    };

    loadFavorites();
    loadReviews();
  }, []);

  // Order actions
  const addOrder = useCallback((orderData: OrderData) => {
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      cakeImage: orderData.cakeImage,
      shopName: orderData.shopName || '가게 정보 없음',
      status: 'inquiry',
      pickupDate: orderData.pickupDate,
      pickupTime: orderData.pickupTime,
      lettering: orderData.lettering,
      createdAt: new Date(),
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const removeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
  }, []);

  // Favorite actions
  const toggleFavorite = useCallback(async (cakeId: number, image: string, shopName: string, tag?: string) => {
    const isExist = favorites.some(f => f.id === cakeId.toString());
    
    // Optimistic UI update
    setFavorites(prev => {
      const updated = isExist 
        ? prev.filter(f => f.id !== cakeId.toString())
        : [...prev, { id: cakeId.toString(), image, shopName, description: tag }];
      
      // Update cache in background
      AsyncStorage.setItem('@favorites_cache', JSON.stringify(updated)).catch(console.error);
      return updated;
    });

    // API Sync
    try {
      if (isExist) {
        await favoriteService.removeFavorite(cakeId);
      } else {
        await favoriteService.addFavorite(cakeId);
      }
    } catch (error) {
      console.error('Failed to sync favorite with server:', error);
      // NOTE: In a robust app, we would revert the optimistic update here if the API fails
    }
  }, [favorites]);

  const removeFavorite = useCallback(async (cakeId: string) => {
    // Optimistic UI
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== cakeId);
      AsyncStorage.setItem('@favorites_cache', JSON.stringify(updated)).catch(console.error);
      return updated;
    });
    
    // API Sync
    try {
      await favoriteService.removeFavorite(parseInt(cakeId, 10));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  }, []);

  const isFavorited = useCallback((cakeId: number) => {
    return favorites.some(f => f.id === cakeId.toString());
  }, [favorites]);

  // Review actions
  const deleteReview = useCallback(async (reviewId: string) => {
    // Optimistic UI update
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== reviewId);
      AsyncStorage.setItem('@reviews_cache', JSON.stringify(updated)).catch(console.error);
      return updated;
    });

    // API Sync
    try {
      await reviewService.deleteReview(parseInt(reviewId, 10));
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  }, []);

  return (
    <ShopContext.Provider value={{
      orders,
      favorites,
      reviews,
      addOrder,
      removeOrder,
      updateOrderStatus,
      toggleFavorite,
      removeFavorite,
      isFavorited,
      deleteReview
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
