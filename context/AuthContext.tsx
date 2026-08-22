import { authService } from "@/services/auth";
import { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
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

// 현재 실행 환경이 Expo Go인지 확인하는 변수 (안전장치)
const isExpoGo = Constants.appOwnership === "expo" || Constants.executionEnvironment === "storeClient";

let GoogleSignin: any;
let statusCodes: any;
if (!isExpoGo) {
  const gs = require("@react-native-google-signin/google-signin");
  GoogleSignin = gs.GoogleSignin;
  statusCodes = gs.statusCodes;
}

const DEFAULT_GOOGLE_WEB_CLIENT_ID =
  "106131390766-mnqk6vkbs4n33s2tt63om1860e6cgaau.apps.googleusercontent.com";
const DEFAULT_GOOGLE_IOS_CLIENT_ID =
  "106131390766-vmcvo280rnguao23e9bkmo76d4fnd850.apps.googleusercontent.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 구글 로그인 설정 및 자동 로그인 검사
  useEffect(() => {
    // Expo Go 환경에서는 네이티브 설정을 건너뜁니다.
    if (!isExpoGo) {
      const webClientId =
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        DEFAULT_GOOGLE_WEB_CLIENT_ID;
      const iosClientId =
        process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
        DEFAULT_GOOGLE_IOS_CLIENT_ID;

      GoogleSignin.configure({
        webClientId,
        iosClientId,
        offlineAccess: false,
      });
    }

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

    // 세션 만료 글로벌 이벤트 리스너 등록
    const { DeviceEventEmitter, Alert } = require('react-native');
    
    let isAlertShown = false;
    const subscription = DeviceEventEmitter.addListener('EXPIRED_SESSION', () => {
      signOut();
      if (!isAlertShown) {
        isAlertShown = true;
        Alert.alert('로그아웃', '세션이 만료되었습니다. 다시 로그인해주세요.', [
          { text: '확인', onPress: () => { isAlertShown = false; } }
        ]);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 네이티브 구글 로그인
  const signInWithGoogle = async () => {
    if (isExpoGo) {
      console.log("Expo Go에서는 구글 로그인 네이티브 기능을 사용할 수 없습니다.");
      alert("Expo Go 모드입니다. 구글 로그인은 실제 기기(또는 에뮬레이터) 빌드에서만 작동합니다.");
      return;
    }

    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // v16 라이브러리 지원 및 getTokens() 보조 호출
      let idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) {
        try {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens?.idToken;
        } catch (tokenErr) {
          console.warn("getTokens fallback failed:", tokenErr);
        }
      }

      if (idToken) {
        // 발급받은 idToken을 백엔드로 바로 전송
        const newToken = await authService.loginWithBackend(idToken);
        if (newToken) {
          setToken(newToken);
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // 신규 회원인 경우 온보딩 페이지로 라우팅되도록 기본 유저 객체 설정
            setUser({
              id: 0,
              email: userInfo.data?.user?.email || userInfo.user?.email || "",
              name: userInfo.data?.user?.name || userInfo.user?.name || "사용자",
              nickname: "",
              phoneNumber: "",
            } as any);
          }
        }
      } else {
        throw new Error("Google ID 토큰을 발급받지 못했습니다.");
      }
    } catch (error: any) {
      if (error.code === statusCodes?.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes?.IN_PROGRESS) {
        console.log("Sign in is in progress already");
      } else if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
        console.error("Play services not available or outdated");
        throw new Error("Google Play 서비스를 사용할 수 없습니다.");
      } else {
        console.error("Login Failed:", error);
        throw new Error(error.message || `로그인 실패 (코드: ${error.code || 'UNKNOWN'})`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (!isExpoGo) {
        await GoogleSignin.signOut();
      }
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
