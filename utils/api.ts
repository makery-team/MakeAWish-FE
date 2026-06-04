import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";

// TODO: 환경 변수 연동
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com";

/**
 * 엑세스 토큰이 만료(401)되었을 때 리프레시 토큰을 통해 새로운 토큰을 발급받습니다.
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;
    
    if (newAccessToken) {
      await AsyncStorage.setItem("auth_token", newAccessToken);
      // 서버에서 refreshToken을 새로 내려준다면 그것도 업데이트 (명세서엔 accessToken만 있음)
      if (data.refreshToken) {
        await AsyncStorage.setItem("refresh_token", data.refreshToken);
      }
      return newAccessToken;
    }
    return null;
  } catch (error) {
    console.error("Token Refresh Error:", error);
    // 재발급 실패 시 저장된 토큰 삭제하여 로그아웃 처리 유도
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("refresh_token");
    return null;
  }
}

/**
 * 인증(Authorization) 헤더를 자동으로 추가하고, 401 응답 시 토큰 재발급 후 재시도하는 fetch 래퍼 함수입니다.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await AsyncStorage.getItem("auth_token");
  
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    let response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

    // 토큰 만료 처리 (401 Unauthorized)
    if (response.status === 401) {
      console.log("Access token expired (401). Attempting to refresh...");
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        console.log("Token successfully refreshed. Retrying request...");
        // 새 토큰으로 헤더 업데이트
        const newHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` };
        // 기존 요청 다시 보내기
        response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers: newHeaders,
        });
      } else {
        console.error("Token refresh failed. User needs to login again.");
        DeviceEventEmitter.emit('EXPIRED_SESSION');
        return response;
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
}
