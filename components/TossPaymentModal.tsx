import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { X, Lock, Zap } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface TossPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  orderNumber: string;
  orderName: string;
  amount: number;
  customerName?: string;
  onSuccess: (data: { paymentKey: string; orderNumber: string; amount: number }) => void;
  onFail: (errorMessage: string) => void;
}

const TOSS_CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
const SUCCESS_URL_PREFIX = 'https://makeawish.app/payment/success';
const FAIL_URL_PREFIX = 'https://makeawish.app/payment/fail';

export default function TossPaymentModal({
  visible,
  onClose,
  orderNumber,
  orderName,
  amount,
  customerName = '고객',
  onSuccess,
  onFail,
}: TossPaymentModalProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  if (!visible) return null;

  // 토스페이먼츠 v1 SDK 결제 요청 HTML
  const paymentHtml = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <script src="https://js.tosspayments.com/v1/payment"></script>
      <style>
        body {
          margin: 0;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 90vh;
        }
        .loading-box {
          text-align: center;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3182f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h3 {
          color: #191f28;
          margin: 0 0 8px;
          font-size: 18px;
        }
        p {
          color: #8b95a1;
          margin: 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="loading-box">
        <div class="spinner"></div>
        <h3>토스페이먼츠 안전결제</h3>
        <p>결제창으로 안전하게 연결 중입니다...</p>
      </div>

      <script>
        document.addEventListener("DOMContentLoaded", function() {
          try {
            var clientKey = '${TOSS_CLIENT_KEY}';
            var tossPayments = TossPayments(clientKey);

            tossPayments.requestPayment('카드', {
              amount: ${amount},
              orderId: '${orderNumber}',
              orderName: '${orderName.replace(/'/g, "\\'")}',
              customerName: '${customerName.replace(/'/g, "\\'")}',
              successUrl: '${SUCCESS_URL_PREFIX}',
              failUrl: '${FAIL_URL_PREFIX}',
            }).catch(function (error) {
              if (error.code === 'USER_CANCEL') {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CANCEL', message: '결제를 취소하셨습니다.' }));
              } else {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAIL', message: error.message || error.code }));
              }
            });
          } catch (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'FAIL', message: err.message }));
          }
        });
      </script>
    </body>
    </html>
  `;

  // URL에서 쿼리 파라미터 파싱
  const parseQueryParams = (url: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const queryString = url.split('?')[1];
    if (!queryString) return params;

    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }
    return params;
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    if (url.startsWith(SUCCESS_URL_PREFIX)) {
      const params = parseQueryParams(url);
      const paymentKey = params.paymentKey;
      const orderId = params.orderId || orderNumber;
      const parsedAmount = Number(params.amount) || amount;

      if (paymentKey) {
        onSuccess({
          paymentKey,
          orderNumber: orderId,
          amount: parsedAmount,
        });
      } else {
        onFail('결제 인증 키(paymentKey)를 수신하지 못했습니다.');
      }
    } else if (url.startsWith(FAIL_URL_PREFIX)) {
      const params = parseQueryParams(url);
      const message = params.message || '결제 처리에 실패했습니다.';
      onFail(message);
    }
  };

  const handleShouldStartLoadWithRequest = (request: { url: string }) => {
    const { url } = request;

    // 1. 일반 웹 URL 및 빈 페이지는 WebView 내부에서 정상 로드
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('about:blank') ||
      url.startsWith('data:')
    ) {
      return true;
    }

    // 2. 외부 결제 앱 커스텀 스킴 (kakaotalk://, kakaopay://, intent://, ispmobile://, shinhan-sr-ansimclick:// 등)
    (async () => {
      try {
        if (Platform.OS === 'android' && url.startsWith('intent:')) {
          try {
            await Linking.openURL(url);
            return;
          } catch (intentErr) {
            // 인텐트 실행 실패 시 fallback URL 또는 마켓 URL 추출
            const packageMatch = url.match(/package=([a-zA-Z0-9._]+)/);
            const fallbackMatch = url.match(/browser_fallback_url=([^;]+)/);

            if (fallbackMatch && fallbackMatch[1]) {
              const fallbackUrl = decodeURIComponent(fallbackMatch[1]);
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`window.location.href = '${fallbackUrl}';`);
              }
              return;
            }

            if (packageMatch && packageMatch[1]) {
              const marketUrl = `market://details?id=${packageMatch[1]}`;
              await Linking.openURL(marketUrl);
              return;
            }
          }
        }

        // 일반 커스텀 앱 스킴 호출
        const canOpen = await Linking.canOpenURL(url).catch(() => false);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(url).catch((e) => {
            console.warn('Cannot open external app scheme:', url, e);
          });
        }
      } catch (error) {
        console.error('Failed to handle external scheme URL:', url, error);
      }
    })();

    // WebView 내부에서는 페이지 로드를 중단하여 ERR_UNKNOWN_URL_SCHEME 에러 방지
    return false;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'CANCEL') {
        onClose();
      } else if (data.type === 'FAIL') {
        onFail(data.message || '결제 진행 중 오류가 발생했습니다.');
      }
    } catch (e) {
      console.error('WebView postMessage parsing error:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Lock size={16} color={theme.colors.primary} />
            <Text style={styles.headerTitle}>토스페이먼츠 안전결제</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* 결제 정보 요약 바 */}
        <View style={styles.orderSummaryBar}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>주문 상품</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{orderName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>최종 결제 금액</Text>
            <Text style={styles.summaryPrice}>{amount.toLocaleString()}원</Text>
          </View>
        </View>

        {/* 개발 및 테스트용 원클릭 바이패스 버튼 */}
        <TouchableOpacity
          style={styles.testBypassButton}
          onPress={() => {
            onSuccess({
              paymentKey: `test_bypass_${Date.now()}`,
              orderNumber,
              amount,
            });
          }}
          activeOpacity={0.85}
        >
          <Zap size={14} color="#D97706" fill="#D97706" />
          <Text style={styles.testBypassText}>
            ⚡ 테스트 환경: 원클릭 결제 승인하기 (인증 생략)
          </Text>
        </TouchableOpacity>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: paymentHtml }}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onNavigationStateChange={handleNavigationStateChange}
            onMessage={handleMessage}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            style={styles.webView}
            mixedContentMode="always"
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>결제 모듈을 불러오는 중입니다...</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  orderSummaryBar: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    maxWidth: '70%',
  },
  summaryPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  testBypassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    gap: 6,
  },
  testBypassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
