import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AWS Elastic Beanstalk 백엔드 베이스 URL 업데이트
const API_BASE_URL = 'http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com';

export const authService = {
  /**
   * 구글 소셜 로그인 시작 (브라우저 열기)
   */
  async startGoogleLogin() {
    // app.json에 설정된 'makeawishfe' 스킴을 사용한 딥링크 주소 생성
    // 결과 예시: makeawishfe://auth-callback
    const redirectUri = Linking.createURL('auth-callback');
    
    // Spring Security OAuth2 엔드포인트
    // 백엔드에서 redirect_uri 파라미터를 지원하도록 설정되어 있어야 합니다.
    const authUrl = `${API_BASE_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    console.log('Attempting login with URL:', authUrl);
    console.log('Expecting redirect to:', redirectUri);

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success') {
        return result.url;
      }
      return null;
    } catch (error) {
      console.error('Google Login Error:', error);
      throw error;
    }
  },

  /**
   * URL에서 토큰 추출 및 저장
   */
  async handleAuthCallback(url: string) {
    console.log('Received Callback URL:', url);
    const { queryParams } = Linking.parse(url);
    
    // 백엔드에서 내려주는 토큰 파라미터명 확인 필요 (보통 accessToken 또는 token)
    const token = (queryParams?.token || queryParams?.accessToken) as string;
    
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
      return token;
    }
    return null;
  },

  /**
   * 현재 유저 정보 가져오기
   */
  async getCurrentUser() {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return null;

    try {
      // API 경로가 /api/v1/users/me 인지 확인 필요
      const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return await response.json();
    } catch (error) {
      console.error('Get Current User Error:', error);
      return null;
    }
  },

  /**
   * 로그아웃
   */
  async logout() {
    await AsyncStorage.removeItem('auth_token');
  }
};
