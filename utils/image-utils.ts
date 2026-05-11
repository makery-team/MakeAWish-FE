import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';

/**
 * 로컬 URI를 Base64 문자열로 변환합니다.
 */
export const uriToBase64 = async (uri: string): Promise<string> => {
  try {
    // 이미 base64 데이터인 경우 그대로 반환
    if (uri.startsWith('data:')) {
      const parts = uri.split('base64,');
      return parts.length > 1 ? parts[1] : parts[0];
    }
    
    // EncodingType.Base64 대신 문자열 리터럴 'base64' 사용 (안정성)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return base64;
  } catch (error) {
    console.error('Error converting URI to Base64:', error);
    throw error;
  }
};

/**
 * 특정 View 리퍼런스를 캡처하여 Base64로 반환합니다.
 * (마스크 생성 등에 사용)
 */
export const captureViewToBase64 = async (viewRef: any): Promise<string> => {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'base64',
    });
    return uri;
  } catch (error) {
    console.error('Error capturing view:', error);
    throw error;
  }
};
