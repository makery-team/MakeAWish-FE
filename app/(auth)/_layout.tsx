import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  // 💡 [임시 코드] 백엔드 DB가 초기화되었을 때 프론트엔드의 낡은 토큰을 지워줍니다.
  useEffect(() => {
    const clearOldToken = async () => {
      await AsyncStorage.clear();
      console.log("🧹 AsyncStorage (기존 토큰) 임시 초기화 완료!");
    };
    clearOldToken();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
