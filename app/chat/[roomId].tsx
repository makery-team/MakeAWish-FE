import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, ChevronLeft } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useChatSocket } from '@/hooks/useChatSocket';
import { chatService } from '@/services/chat';
import { DirectChatMessage } from '@/types';


export default function ChatRoomScreen() {
  const router = useRouter();
  const { roomId, storeName, myUserId } = useLocalSearchParams<{ roomId: string; storeName: string; myUserId: string }>();
  const numericRoomId = roomId ? parseInt(roomId, 10) : undefined;
  
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // 소켓 훅 연결
  const { messages, setMessages, isConnected, sendMessage } = useChatSocket(numericRoomId, Number(myUserId) || undefined);

  // 대화 기록 초기화
  useEffect(() => {
    if (numericRoomId) {
      chatService.getChatHistory(numericRoomId).then((history) => {
        if (history && history.length > 0) {
          setMessages(history);
        }
      });
    }
  }, [numericRoomId, setMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !isConnected) return;
    
    // 1. 소켓 전송
    sendMessage(inputText);
    
    // 2. 로컬 화면 업데이트 (Optimistic Update)
    // 실제 서버 환경에 따라 서버가 내려주는 메아리(Echo)만 렌더링할지, 클라이언트가 먼저 붙일지 결정해야 합니다.
    // 여기서는 화면 즉각 반응을 위해 클라이언트에 먼저 추가합니다.
    const newMsg: DirectChatMessage = {
      roomNumber: numericRoomId!,
      userId: Number(myUserId) || 0, // 내 ID
      message: inputText,
      imageUrl: null,
      createdTime: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: DirectChatMessage }) => {
    const isMe = item.userId === Number(myUserId);
    const timeText = new Date(item.createdTime).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowStore]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{storeName?.substring(0, 1) || 'S'}</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleStore]}>
          <Text style={[styles.messageText, isMe ? styles.textMe : styles.textStore]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.timeText}>{timeText}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* 커스텀 헤더 */}
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: storeName || '매장 채팅',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
              <ChevronLeft size={24} color="#111827" />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: 'white' },
        }} 
      />

      {/* 로딩 표시 */}
      {!isConnected && (
        <View style={styles.connectingBanner}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.connectingText}>연결 중...</Text>
        </View>
      )}

      {/* 메시지 리스트 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* 입력 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() || !isConnected ? styles.sendButtonDisabled : null]}
            onPress={handleSend}
            disabled={!inputText.trim() || !isConnected}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  connectingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
  },
  connectingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowStore: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleStore: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  textMe: {
    color: 'white',
  },
  textStore: {
    color: '#1F2937',
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 2, // input과 높이 맞춤
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
