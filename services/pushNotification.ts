import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '@/utils/api';

const PUSH_TOKEN_STORAGE_KEY = 'makeawish_expo_push_token';

// 🌟 포그라운드(앱 켜진 상태)에서도 헤더 푸시 팝업 및 사운드/진동 허용 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 1. OS 푸시 권한 요청 및 백엔드 토큰 등록
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  let token: string | null = null;

  try {
    // Android 전용 알림 채널 설정 (최고 우선순위, 사운드, 진동)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '주문 및 주요 알림',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EC4899',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.info('📱 [PushNotification] 사용자가 푸시 알림 권한을 허용하지 않았습니다.');
        return null;
      }

      // Expo Push Token 발급
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: undefined, // Expo SDK auto-detects from app.json
      });
      token = tokenData.data;
    } else {
      console.info('📱 [PushNotification] 시뮬레이터에서는 원격 푸시 토큰이 제한될 수 있습니다.');
    }

    if (token) {
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);

      // 백엔드에 디바이스 토큰 등록
      try {
        await fetchWithAuth('/api/notifications/device-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            platform: Platform.OS.toUpperCase(),
          }),
        });
        console.info('📱 [PushNotification] 디바이스 토큰 백엔드 등록 성공');
      } catch (err) {
        console.warn('📱 [PushNotification] 백엔드 토큰 등록 실패:', err);
      }
    }
  } catch (error) {
    console.warn('📱 [PushNotification] 푸시 토큰 발급/등록 중 오류:', error);
  }

  return token;
}

/**
 * 2. 디바이스 푸시 토큰 해제 (로그아웃 시)
 */
export async function unregisterPushNotificationAsync(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (token) {
      await fetchWithAuth('/api/notifications/device-token', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: Platform.OS.toUpperCase() }),
      });
      await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('📱 [PushNotification] 푸시 토큰 삭제 실패:', err);
  }
}
