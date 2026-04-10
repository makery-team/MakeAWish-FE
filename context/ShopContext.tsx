import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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
  const toggleFavorite = useCallback((cakeId: number, image: string, shopName: string, tag?: string) => {
    setFavorites(prev => {
      const isExist = prev.some(f => f.id === cakeId.toString());
      if (isExist) {
        return prev.filter(f => f.id !== cakeId.toString());
      } else {
        return [...prev, {
          id: cakeId.toString(),
          image,
          shopName,
          description: tag
        }];
      }
    });
  }, []);

  const removeFavorite = useCallback((cakeId: string) => {
    setFavorites(prev => prev.filter(f => f.id !== cakeId));
  }, []);

  const isFavorited = useCallback((cakeId: number) => {
    return favorites.some(f => f.id === cakeId.toString());
  }, [favorites]);

  // Review actions
  const deleteReview = useCallback((reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
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
