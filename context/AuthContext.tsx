import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (userData: Pick<User, 'id' | 'email'> & Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (userData: Pick<User, 'id' | 'email'> & Partial<User>) => {
    const newUser: User = {
      nickname: '',
      phoneNumber: '',
      language: 'ko',
      ...userData
    } as User;
    
    setUser(newUser);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to save user session:', error);
    }
  };

  const signOut = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to remove user session:', error);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      try {
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Failed to update user session:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, updateUser }}>
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
