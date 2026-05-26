import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Bell, User, X, Map as MapIcon, List as ListIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { MyPage } from './my-page';
import { theme } from '@/constants/theme';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: '새로운 메시지',
    message: '케이크 주문이 확인되었습니다. 주문 내역을 확인해주세요.',
    time: '10분 전',
    isRead: false,
  },
];

interface HeaderProps {
  onNavigateToOrders?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToReviews?: () => void;
  viewMode?: 'list' | 'map';
  onToggleView?: () => void;
}

export function Header({
  onNavigateToOrders,
  onNavigateToFavorites,
  onNavigateToReviews,
  viewMode = 'list',
  onToggleView,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.wrapper, { paddingTop: statusBarHeight }]}>
      <View style={styles.header}>
        {/* Logo & Toggle Container */}
        <View style={styles.leftSection}>
          <Text style={styles.logo}>Make a Wish</Text>
          
          {/* View Mode Toggle */}
          <TouchableOpacity 
            style={styles.viewToggle} 
            onPress={onToggleView}
            activeOpacity={0.8}
          >
            {viewMode === 'list' ? (
              <View style={styles.toggleItem}>
                <MapIcon size={16} color={theme.colors.primary} />
                <Text style={styles.toggleText}>지도</Text>
              </View>
            ) : (
              <View style={styles.toggleItem}>
                <ListIcon size={16} color={theme.colors.primary} />
                <Text style={styles.toggleText}>리스트</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Right Icons */}
        <View style={styles.rightIcons}>
          <View style={styles.iconWrapper}>
            <TouchableOpacity
              onPress={() => setIsNotificationOpen(!isNotificationOpen)}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Bell size={24} color={theme.colors.text} />
              {unreadCount > 0 && <View style={styles.unreadBadge} />}
            </TouchableOpacity>

            {/* Notification Panel */}
            {isNotificationOpen && (
              <>
                <Pressable
                  style={styles.backdrop}
                  onPress={() => setIsNotificationOpen(false)}
                />
                <Animated.View 
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={styles.notificationPanel}
                >
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationHeaderTitle}>알림</Text>
                    <TouchableOpacity onPress={() => setIsNotificationOpen(false)}>
                      <X size={18} color={theme.colors.gray} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.notificationList} bounces={false}>
                    {mockNotifications.length > 0 ? (
                      mockNotifications.map((notification) => (
                        <View
                          key={notification.id}
                          style={[
                            styles.notificationItem,
                            !notification.isRead && styles.unreadNotification,
                          ]}
                        >
                          <View style={styles.notificationItemHeader}>
                            <Text style={styles.notificationTitle}>
                              {notification.title}
                            </Text>
                            <Text style={styles.notificationTime}>
                              {notification.time}
                            </Text>
                          </View>
                          <Text style={styles.notificationMessage}>
                            {notification.message}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyNotifications}>
                        <Text style={styles.emptyText}>새로운 알림이 없습니다.</Text>
                      </View>
                    )}
                  </ScrollView>

                  {mockNotifications.length > 0 && (
                    <TouchableOpacity style={styles.notificationFooter}>
                      <Text style={styles.footerText}>모든 알림 읽음 처리</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setIsMyPageOpen(true)}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <User size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MyPage Modal */}
      <MyPage
        isOpen={isMyPageOpen}
        onClose={() => setIsMyPageOpen(false)}
        onNavigateToOrders={() => onNavigateToOrders?.()}
        onNavigateToFavorites={() => onNavigateToFavorites?.()}
        onNavigateToReviews={() => onNavigateToReviews?.()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    zIndex: 999,
    position: 'relative',
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  viewToggle: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    position: 'relative',
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: -WINDOW_WIDTH,
    right: -WINDOW_WIDTH,
    height: 1000,
    zIndex: 90,
  },
  notificationPanel: {
    position: 'absolute',
    top: 70,
    right: -40,
    width: WINDOW_WIDTH - 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notificationHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF9FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  notificationList: {
    maxHeight: 320,
  },
  notificationItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotification: {
    backgroundColor: '#FFF9FB',
  },
  notificationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  emptyNotifications: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  notificationFooter: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
