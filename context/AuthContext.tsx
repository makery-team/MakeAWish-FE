import { authService } from "@/services/auth";
import { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import React, { createContext, useContext, useEffect, useState } from "react";

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

  // 구글 로그인 설정 및 자동 로그인 검사
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
    });

    const initAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        if (storedToken) {
          setToken(storedToken);
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            await authService.logout();
            setToken(null);
          }
        }
      } catch (error) {
        console.error("Auth Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 네이티브 구글 로그인
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // v16 라이브러리는 userInfo.data 안에 idToken이 들어있습니다.
      const idToken = userInfo.data?.idToken || userInfo.idToken;

      if (idToken) {
        // 발급받은 idToken을 백엔드로 바로 전송
        const newToken = await authService.loginWithBackend(idToken);
        if (newToken) {
          setToken(newToken);
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } else {
        throw new Error("No ID token returned from Google Sign In");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error("Play services not available or outdated");
      } else {
        console.error("Login Failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await authService.logout();
      await AsyncStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signInWithGoogle, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
