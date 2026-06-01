import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, Trash2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { chatService } from '@/services/chat';
import { DirectChatRoom } from '@/types';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ChatScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<DirectChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRooms = async () => {
    try {
      const response = await chatService.getChatRooms();
      setRooms(response);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRooms();
  };

  const handleDeleteRoom = (roomNumber: number, storeName: string) => {
    Alert.alert(
      '채팅방 나가기',
      `${storeName}님과의 채팅방을 나가시겠습니까? 대화 내용이 모두 삭제됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '나가기', 
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteChatRoom(roomNumber);
              setRooms(prev => prev.filter(r => r.roomNumber !== roomNumber));
            } catch (error) {
              console.error('Failed to delete chat room', error);
              Alert.alert('오류', '채팅방을 삭제하지 못했습니다.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: DirectChatRoom }) => {
    const lastMessage = item.messages && item.messages.length > 0 
      ? item.messages[item.messages.length - 1] 
      : null;
      
    const formattedDate = lastMessage?.createdTime 
      ? new Date(lastMessage.createdTime).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
      : '';
      
    // 임시로 매장 이름 대신 ID 사용 (백엔드 명세상 매장 이름이 반환되지 않음)
    const displayStoreName = `매장 ${item.otherId}`;
    const previewMessage = lastMessage?.message || '대화를 시작해 보세요!';
    
    return (
      <TouchableOpacity 
        style={styles.roomItem}
        onPress={() => router.push(`/chat/${item.roomNumber}?storeName=${encodeURIComponent(displayStoreName)}&myUserId=${item.userId}`)}
      >
        <View style={styles.avatarContainer}>
          <MessageSquare size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.roomInfo}>
          <View style={styles.roomHeader}>
            <Text style={styles.storeName}>{displayStoreName}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <Text style={styles.previewText} numberOfLines={1}>
            {previewMessage}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteRoom(item.roomNumber, displayStoreName)}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>로딩 중...</Text>
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageSquare size={48} color="#D1D5DB" strokeWidth={1} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>참여 중인 채팅방이 없습니다.</Text>
          <Text style={styles.emptySubtext}>매장에 문의를 남겨 대화를 시작해 보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderItem}
          keyExtractor={item => item.roomNumber.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // 탭바 영역 확보
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roomInfo: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  previewText: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
