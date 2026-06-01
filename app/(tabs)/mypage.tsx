import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { theme } from '@/constants/theme';
import { Settings, Heart, Clock, MessageSquare, ChevronRight, LogOut, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth';
import { orderService } from '@/services/order';

export default function MyPageScreen() {
  const { user, signOut, updateUser } = useAuth();
  const router = useRouter();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    // 마이페이지 진입 시마다 최신 유저 정보와 주문 건수 업데이트
    const fetchLatestData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData) {
          updateUser(userData);
        }
        
        const orders = await orderService.getMyOrders();
        setOrderCount(orders.length);
      } catch (error) {
        console.error('Failed to fetch mypage data:', error);
      }
    };
    fetchLatestData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말 로그아웃 하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "로그아웃", 
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const renderMenuItem = (icon: React.ReactNode, title: string, subtitle?: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          {icon}
        </View>
        <View>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <ChevronRight size={20} color={theme.colors.gray} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 헤더 타이틀 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.nickname?.[0] || '?'}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{user?.nickname || '닉네임 없음'}</Text>
              <Text style={styles.email}>{user?.email || '이메일 정보 없음'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.editProfileButton} 
              onPress={() => router.push('/edit-profile')}
            >
              <Text style={styles.editProfileButtonText}>수정</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{orderCount}</Text>
              <Text style={styles.statLabel}>주문 내역</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>찜한 가게</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>작성 리뷰</Text>
            </View>
          </View>
        </View>

        {/* 메뉴 리스트 */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>쇼핑 정보</Text>
          {renderMenuItem(<Clock size={20} color={theme.colors.primary} />, "주문/예약 내역", "진행중인 주문을 확인하세요", () => router.push('/orders'))}
          {renderMenuItem(<Heart size={20} color={theme.colors.primary} />, "찜한 목록", "내가 찜한 케이크와 가게", () => router.push('/favorites'))}
          {renderMenuItem(<MessageSquare size={20} color={theme.colors.primary} />, "내 리뷰 관리", undefined, () => router.push('/reviews'))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>앱 설정</Text>
          {renderMenuItem(<Settings size={20} color={theme.colors.gray} />, "설정", "앱 환경설정 및 계정 관리")}
        </View>

        {/* 하단 로그아웃 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  editProfileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    marginLeft: 8,
  },
  editProfileButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gray,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  menuSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
