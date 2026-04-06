import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { Bell, User, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MyPage } from './my-page';

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
}

export function Header({
  onNavigateToOrders,
  onNavigateToFavorites,
  onNavigateToReviews,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {/* Logo */}
        <Text style={styles.logo}>Make a Wish</Text>

        {/* Right Icons */}
        <View style={styles.rightIcons}>
          <View style={styles.iconWrapper}>
            <TouchableOpacity
              onPress={() => setIsNotificationOpen(!isNotificationOpen)}
              style={styles.iconButton}
            >
              <Bell size={24} color="#374151" />
              {unreadCount > 0 && <View style={styles.unreadBadge} />}
            </TouchableOpacity>

            {/* Notification Panel */}
            {isNotificationOpen && (
              <>
                <Pressable
                  style={styles.backdrop}
                  onPress={() => setIsNotificationOpen(false)}
                />
                <View style={styles.notificationPanel}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationHeaderTitle}>알림</Text>
                    <TouchableOpacity onPress={() => setIsNotificationOpen(false)}>
                      <X size={18} color="#4B5563" />
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
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setIsMyPageOpen(true)}
            style={styles.iconButton}
          >
            <User size={24} color="#374151" />
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
    zIndex: 50,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFB6C1', // Fallback since gradient text is complex
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    position: 'relative',
  },
  iconButton: {
    padding: 4,
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: '#FFB6C1',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 40,
  },
  notificationPanel: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: WINDOW_WIDTH - 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 50,
    overflow: 'hidden',
  },
  notificationHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF5F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationHeaderTitle: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  notificationList: {
    maxHeight: 300,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotification: {
    backgroundColor: '#FFF5F7',
  },
  notificationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  emptyNotifications: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  notificationFooter: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#FF69B4',
    fontWeight: '500',
  },
});
