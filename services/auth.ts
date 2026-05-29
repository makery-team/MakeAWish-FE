import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  "http://Make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com";

export const authService = {
  /**
   * 백엔드가 원하는 idToken을 전달하여 로그인 처리
   * (LoginScreen 컴포넌트의 구글 로그인 훅에서 받은 idToken을 이 함수로 넘겨주어야 합니다.)
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
          // 💡 수정된 핵심 포인트: 백엔드 DTO(SocialLoginRequest)의 필드명과 정확히 일치시킵니다.
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

      if (tokenResponse.token || tokenResponse.accessToken) {
        const token = tokenResponse.token || tokenResponse.accessToken;
        await AsyncStorage.setItem("auth_token", token);
        return token;
      }
      return null;
    } catch (error) {
      console.error("Backend Verification Error:", error);
      throw error;
    }
  },

  /**
   * 발급받은 토큰을 이용해 현재 로그인한 유저의 정보를 가져오는 함수
   */
  async getCurrentUser() {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

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
  },
};
