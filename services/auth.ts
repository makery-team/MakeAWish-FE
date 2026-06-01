import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithAuth } from "@/utils/api";

const API_BASE_URL =
  "http://Make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com";

export const authService = {
  /**
   * 백엔드가 원하는 idToken을 전달하여 로그인 처리
   */
  async loginWithBackend(idToken: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          token: idToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `🚨 [구글 토큰 백엔드 전송 실패] 상태 코드: ${response.status}`,
        );
        console.error(`🚨 상세 내용: ${errorText}`);
        throw new Error("백엔드 인증 실패");
      }

      const tokenResponse = await response.json();

      const accessToken = tokenResponse.accessToken || tokenResponse.token;
      const refreshToken = tokenResponse.refreshToken;

      if (accessToken) {
        await AsyncStorage.setItem("auth_token", accessToken);
      }
      if (refreshToken) {
        await AsyncStorage.setItem("refresh_token", refreshToken);
      }
      return accessToken || null;
    } catch (error) {
      console.error("Backend Verification Error:", error);
      throw error;
    }
  },

  /**
   * 발급받은 토큰을 이용해 현재 로그인한 유저의 정보를 가져오는 함수
   */
  async getCurrentUser() {
    try {
      const response = await fetchWithAuth("/api/users/me");

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `\n🚨 [내 정보 불러오기 실패] 상태 코드: ${response.status}`,
        );
        console.error(`🚨 [백엔드 상세 응답 내용]: ${errorText}\n`);
        throw new Error(`Failed to fetch user (Status: ${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get Current User Error:", error);
      return null;
    }
  },

  async logout() {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("refresh_token");
  },
};
