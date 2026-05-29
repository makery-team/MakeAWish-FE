import { authService } from "@/services/auth";
import { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

// Expo 환경에서 브라우저 세션을 정상 동작시키기 위한 필수 선언
WebBrowser.maybeCompleteAuthSession();

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

  // 자동 로그인 검사 효과
  useEffect(() => {
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

  // 1. 구글 로그인 버튼 함수 (iOS Code 교환 방식 최종 적용본)
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);

      const clientId = Platform.select({
        ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        default: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });

      if (!clientId) {
        throw new Error(
          "환경 변수에 일치하는 Google Client ID가 설정되지 않았습니다.",
        );
      }

      // iOS일 경우 구글 콘솔의 '역방향 클라이언트 ID' 사용
      const redirectUri =
        Platform.OS === "ios"
          ? "com.googleusercontent.apps.106131390766-vmcvo280rnguao23e9bkmo76d4fnd850:/oauth2redirect"
          : "makeawishfe://oauth-callback";

      // response_type을 id_token에서 'code'로 변경
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent("openid profile email")}`;

      // 시스템 브라우저 호출
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
      );

      // 인증 성공 시 URL에서 데이터 추출
      if (result.type === "success" && result.url) {
        const queryString =
          result.url.split("?")[1] || result.url.split("#")[1];
        if (!queryString) {
          throw new Error("리디렉션 URL에서 파라미터를 찾을 수 없습니다.");
        }

        const urlParams = new URLSearchParams(queryString);
        const code = urlParams.get("code");

        if (code) {
          // 발급받은 code를 구글 토큰 서버로 보내서 id_token으로 교환
          const tokenExchangeResponse = await fetch(
            "https://oauth2.googleapis.com/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `code=${code}&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_type=authorization_code`,
            },
          );

          const tokenData = await tokenExchangeResponse.json();

          if (tokenData.id_token) {
            // 교환받은 id_token을 백엔드로 전송
            const newToken = await authService.loginWithBackend(
              tokenData.id_token,
            );
            if (newToken) {
              setToken(newToken);
              const userData = await authService.getCurrentUser();
              setUser(userData);
            }
          } else {
            console.error("구글 토큰 교환 실패:", tokenData);
          }
        } else {
          console.error("URL에서 인증 Code를 찾을 수 없습니다.");
        }
      }
    } catch (error) {
      console.error("Login Failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
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
