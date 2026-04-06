import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import {
  X,
  ChevronRight,
  Package,
  Heart,
  Star,
  Settings,
  LogOut,
  LucideIcon,
} from 'lucide-react-native';

interface MyPageProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToOrders: () => void;
  onNavigateToFavorites: () => void;
  onNavigateToReviews: () => void;
}

interface MenuItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

export function MyPage({
  isOpen,
  onClose,
  onNavigateToOrders,
  onNavigateToFavorites,
  onNavigateToReviews,
}: MyPageProps) {
  const menuItems: MenuItem[] = [
    {
      id: 'orders',
      icon: Package,
      title: '나의 주문내역',
      description: '주문 중인 케이크와 이전 주문내역 확인',
      color: '#FF69B4',
      bgColor: '#FFE4E1',
      onClick: () => {
        onNavigateToOrders();
        onClose();
      },
    },
    {
      id: 'favorites',
      icon: Heart,
      title: '찜한 케이크',
      description: '찜한 케이크를 모아보세요',
      color: '#FF85C0',
      bgColor: '#FFF0F5',
      onClick: () => {
        onNavigateToFavorites();
        onClose();
      },
    },
    {
      id: 'reviews',
      icon: Star,
      title: '작성한 리뷰',
      description: '구매하신 케이크 리뷰 관리',
      color: '#87CEEB',
      bgColor: '#E6F3FF',
      onClick: () => {
        onNavigateToReviews();
        onClose();
      },
    },
    {
      id: 'settings',
      icon: Settings,
      title: '설정',
      description: '내 정보 및 알림 설정',
      color: '#9CA3AF',
      bgColor: '#F3F4F6',
      onClick: () => {
        // Handle settings
        onClose();
      },
    },
  ];

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* User Profile */}
          <View style={styles.profileSection}>
            <View style={styles.profileContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>J</Text>
              </View>
              <View>
                <Text style={styles.userName}>Jane Doe</Text>
                <Text style={styles.userEmail}>jane.doe@email.com</Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={item.onClick}
                  style={styles.menuItem}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
                    <Icon size={24} color={item.color} />
                  </View>
                  <View style={styles.menuTextContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton}>
              <LogOut size={20} color="#6B7280" />
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFB6C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuList: {
    paddingVertical: 16,
  },
  menuItem: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
});
