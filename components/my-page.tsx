import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import {
  X,
  ChevronRight,
  Package,
  Heart,
  Star,
  Settings,
  LogOut,
  LucideIcon,
  User as UserIcon,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

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
  const { user, signOut } = useAuth();
  
  const handleLogout = () => {
    signOut();
    onClose();
  };

  const menuItems: MenuItem[] = [
    {
      id: 'orders',
      icon: Package,
      title: '나의 주문내역',
      description: '주문 중인 케이크와 이전 주문내역 확인',
      color: theme.colors.primary,
      bgColor: '#FFF0F5',
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
      bgColor: '#FFF5F7',
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
      color: theme.colors.secondary,
      bgColor: '#F0F9FF',
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
      color: theme.colors.gray,
      bgColor: '#F9FAFB',
      onClick: () => {
        onClose();
      },
    },
  ];

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Profile */}
          <View style={styles.profileSection}>
            <View style={styles.profileContent}>
              <View style={styles.avatar}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.avatarImage}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <UserIcon size={32} color="#fff" />
                )}
              </View>
              <View>
                <Text style={styles.userName}>{user?.nickname || 'GUEST'}</Text>
                <Text style={styles.userEmail}>{user?.email || '로그인이 필요합니다'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editProfileBtn}>
              <Text style={styles.editProfileText}>프로필 수정</Text>
            </TouchableOpacity>
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
                  activeOpacity={0.6}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.bgColor }]}>
                    <Icon size={24} color={item.color} />
                  </View>
                  <View style={styles.menuTextContent}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                  <ChevronRight size={20} color="#D1D5DB" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <LogOut size={20} color={theme.colors.gray} />
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>버전 1.0.0 (build 20260406)</Text>
          </View>
        </ScrollView>
      </View>
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
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFF9FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  editProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  menuList: {
    paddingVertical: 20,
  },
  menuItem: {
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  menuDescription: {
    fontSize: 13,
    color: theme.colors.gray,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 16,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.gray,
  },
  versionText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
