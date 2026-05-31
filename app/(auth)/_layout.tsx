import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  // 임시 초기화 코드 제거됨: 더 이상 토큰을 임의로 삭제하지 않습니다.

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
