import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, GowunDodum_400Regular } from "@expo-google-fonts/gowun-dodum";
import { Text, TextInput } from "react-native";

// @ts-ignore
if (Text.defaultProps == null) Text.defaultProps = {};
// @ts-ignore
Text.defaultProps.style = { fontFamily: 'GowunDodum_400Regular' };
// @ts-ignore
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
// @ts-ignore
TextInput.defaultProps.style = { fontFamily: 'GowunDodum_400Regular' };

SplashScreen.preventAutoHideAsync();
import { InquiryProvider } from "@/context/InquiryContext";
import { ShopProvider } from "@/context/ShopContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/services/pushNotification';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Redirect to main app if authenticated and in auth group
      // Only if signup is complete (nickname and phone are set)
      if (user.nickname && user.phoneNumber) {
        router.replace("/(tabs)");
      } else if (segments[1] !== "signup") {
        router.replace("/(auth)/signup");
      }
    }
  }, [user, isLoading, segments, router]);

  // 📱 유저 로그인 시 푸시 토큰 등록 및 OS 알림 클릭 딥링크 연동
  useEffect(() => {
    if (!user) return;

    registerForPushNotificationsAsync();

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      try {
        const data = response.notification.request.content.data;
        if (data?.targetId) {
          if (data.type === 'ORDER' || data.type === 'PAYMENT') {
            router.push({ pathname: '/orders/[id]', params: { id: String(data.targetId) } });
          } else if (data.type === 'CHAT') {
            router.push('/chat');
          }
        }
      } catch (err) {
        console.warn('푸시 탭 네비게이션 실패:', err);
      }
    });

    return () => {
      responseListener.remove();
    };
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);
  if (isLoading) {
    return null; // Or a splash screen component
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    GowunDodum_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ShopProvider>
            <InquiryProvider>
              <RootLayoutNav />
            </InquiryProvider>
          </ShopProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
