import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react-native';
import { notificationService } from '@/services/notification';
import { theme } from '@/constants/theme';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderPush, setOrderPush] = useState(true);
  const [chatPush, setChatPush] = useState(true);
  const [marketingPush, setMarketingPush] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await notificationService.getSettings();
        setOrderPush(data.orderPushEnabled);
        setChatPush(data.chatPushEnabled);
        setMarketingPush(data.marketingPushEnabled);
      } catch (err) {
        console.warn('알림 설정 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (type: 'order' | 'chat' | 'marketing', nextVal: boolean) => {
    let nextOrder = orderPush;
    let nextChat = chatPush;
    let nextMarketing = marketingPush;

    if (type === 'order') {
      setOrderPush(nextVal);
      nextOrder = nextVal;
    } else if (type === 'chat') {
      setChatPush(nextVal);
      nextChat = nextVal;
    } else if (type === 'marketing') {
      setMarketingPush(nextVal);
      nextMarketing = nextVal;

      const now = new Date();
      const formattedDate = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;
      if (nextVal) {
        Alert.alert(
          '혜택 알림 수신 동의',
          `[MakeAWish]\n수신동의 일시: ${formattedDate}\n할인 쿠폰, 이벤트 및 마케팅 알림 수신에 동의하셨습니다.`
        );
      } else {
        Alert.alert(
          '혜택 알림 수신 철회',
          `[MakeAWish]\n철회 일시: ${formattedDate}\n혜택 및 마케팅 알림 수신이 해제되었습니다.`
        );
      }
    }

    try {
      setSaving(true);
      await notificationService.updateSettings({
        orderPushEnabled: nextOrder,
        chatPushEnabled: nextChat,
        marketingPushEnabled: nextMarketing,
      });
    } catch (err) {
      Alert.alert('알림', '설정 변경 중 오류가 발생했습니다.');
      // 롤백
      if (type === 'order') setOrderPush(!nextVal);
      if (type === 'chat') setChatPush(!nextVal);
      if (type === 'marketing') setMarketingPush(!nextVal);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={styles.headerRight}>
          {saving && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* 주요 알림 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>필수 서비스 알림</Text>

            {/* 주문 알림 */}
            <View style={styles.settingItem}>
              <View style={styles.iconContainer}>
                <Bell size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.settingTitle}>주문 및 결제 알림</Text>
                <Text style={styles.settingDescription}>
                  견적 도착, 주문 상태 변경, 추가금, 픽업 준비 완료 알림을 실시간으로 수신합니다.
                </Text>
              </View>
              <Switch
                value={orderPush}
                onValueChange={(val) => handleToggle('order', val)}
                trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* 채팅 알림 */}
            <View style={styles.settingItem}>
              <View style={styles.iconContainer}>
                <MessageSquare size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.settingTitle}>1:1 채팅 알림</Text>
                <Text style={styles.settingDescription}>
                  케이크 제작 및 상담 관련 실시간 새 메시지 도착 알림을 수신합니다.
                </Text>
              </View>
              <Switch
                value={chatPush}
                onValueChange={(val) => handleToggle('chat', val)}
                trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* 마케팅 알림 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>선택 혜택 알림</Text>

            {/* 혜택/마케팅 알림 */}
            <View style={styles.settingItem}>
              <View style={styles.iconContainer}>
                <Sparkles size={20} color="#F59E0B" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.settingTitle}>혜택 및 이벤트 알림</Text>
                <Text style={styles.settingDescription}>
                  할인 쿠폰, 추천 케이크 샵 소식 및 맞춤 프로모션 알림을 수신합니다.
                </Text>
              </View>
              <Switch
                value={marketingPush}
                onValueChange={(val) => handleToggle('marketing', val)}
                trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* 안내 박스 */}
          <View style={styles.infoCard}>
            <ShieldCheck size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              스마트폰 기기 자체 알림이 꺼져있는 경우 푸시가 울리지 않을 수 있습니다. {'\n'}
              기기 [설정 {'>'} 알림 {'>'} MakeAWish]에서 알림 권한을 확인해주세요.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 32,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});
