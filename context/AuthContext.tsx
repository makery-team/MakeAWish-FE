import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // 토큰은 있는데 유저 정보를 못 가져오면 토큰 만료로 간주
            await authService.logout();
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth Init Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const callbackUrl = await authService.startGoogleLogin();
      if (callbackUrl) {
        const newToken = await authService.handleAuthCallback(callbackUrl);
        if (newToken) {
          setToken(newToken);
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Login Failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      // 필요 시 백엔드 업데이트 API 호출 로직 추가
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signInWithGoogle, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
