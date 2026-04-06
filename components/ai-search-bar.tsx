import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  FlatList,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedKeyboard,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Sparkles, Send, X, Grid3x3, ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';

import { ImageSlider } from './image-slider';
import { OrderReminderCard } from './order-reminder-card';
import { SAMPLE_CAKE_IMAGES, INITIAL_AI_MESSAGE } from '@/constants/mock-data';
import type { Message, ConversationState, InquiryMode, OrderData, ChatMode } from '@/types';
import { theme } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLLAPSED_BAR_HEIGHT = 60;
const HALF_HEIGHT = SCREEN_HEIGHT * 0.45;
const FULL_HEIGHT = SCREEN_HEIGHT * 0.9;

interface AISearchBarProps {
  onCakeSelect?: (image: string, shopName: string) => void;
  inquiryMode?: InquiryMode;
  onInquiryComplete?: (orderData?: OrderData) => void;
}

type InquiryStep = 'reminder' | 'pickupDate' | 'lettering' | 'allergies' | 'additional' | 'complete';

export function AISearchBar({ onCakeSelect, inquiryMode, onInquiryComplete }: AISearchBarProps) {
  const insets = useSafeAreaInsets();
  const routerNavigation = useNavigation();
  const keyboard = useAnimatedKeyboard();

  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch (e) {
    tabBarHeight = insets.bottom + 60;
  }

  const CLOSED_HEIGHT = tabBarHeight + COLLAPSED_BAR_HEIGHT + 10;

  const [sheetState, setSheetState] = useState<'closed' | 'half' | 'full'>('closed');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([INITIAL_AI_MESSAGE]);
  const [conversationState, setConversationState] = useState<ConversationState>({});
  const [imageViewMode, setImageViewMode] = useState<{ [key: number]: 'slide' | 'grid' }>({});
  const [chatMode, setChatMode] = useState<ChatMode>('search');
  const [showReminder, setShowReminder] = useState(false);
  const [inquiryStep, setInquiryStep] = useState<InquiryStep>('reminder');
  const flatListRef = useRef<FlatList>(null);

  const translateY = useSharedValue(SCREEN_HEIGHT - CLOSED_HEIGHT);
  const context = useSharedValue(0);

  const resetChat = () => {
    Keyboard.dismiss();
    setMessages([INITIAL_AI_MESSAGE]);
    setConversationState({});
    setChatMode('search');
    setShowReminder(false);
    setInquiryStep('reminder');
    setInputValue('');
    setImageViewMode({});
  };

  // Hide tab bar when sheet is open to prevent overlap
  useEffect(() => {
    if (sheetState !== 'closed') {
      routerNavigation.setOptions({
        tabBarStyle: { display: 'none' }
      });
    } else {
      // Re-apply original styles from _layout.tsx would be better, 
      // but 'flex' or undefined usually restores it in Expo Router
      routerNavigation.setOptions({
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }
      });
    }
  }, [sheetState, routerNavigation]);

  useEffect(() => {
    if (inquiryMode?.active && inquiryMode.image) {
      setConversationState({
        region: inquiryMode.region,
        size: inquiryMode.size,
        design: inquiryMode.design,
        selectedCakeImage: inquiryMode.image,
        shopName: inquiryMode.shopName,
      });
      setChatMode('inquiry');
      setShowReminder(true);
      setInquiryStep('reminder');
      setSheetState('full');
      translateY.value = withSpring(SCREEN_HEIGHT - FULL_HEIGHT);
    }
  }, [inquiryMode]);

  useEffect(() => {
    if (sheetState === 'closed') {
      translateY.value = withSpring(SCREEN_HEIGHT - CLOSED_HEIGHT);
    } else if (sheetState === 'half') {
      translateY.value = withSpring(SCREEN_HEIGHT - HALF_HEIGHT);
    } else if (sheetState === 'full') {
      translateY.value = withSpring(SCREEN_HEIGHT - FULL_HEIGHT);
    }
  }, [sheetState, CLOSED_HEIGHT]);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showReminder]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    Keyboard.dismiss();
    const newMessages = [...messages];
    newMessages.push({ type: 'user', text: inputValue });

    if (chatMode === 'inquiry') {
      if (inquiryStep === 'pickupDate') {
        setConversationState({ ...conversationState, pickupDate: inputValue });
        setInquiryStep('lettering');
        newMessages.push({
          type: 'ai',
          text: `${inputValue}로 픽업 예약 도와드릴게요.\n다음으로 케이크에 들어갈 레터링 문구를 입력해주세요!`,
          messageId: 'lettering',
        });
      } else if (inquiryStep === 'lettering') {
        setConversationState({ ...conversationState, lettering: inputValue });
        setInquiryStep('allergies');
        newMessages.push({
          type: 'ai',
          text: `레터링 확인했습니다. 혹시 알러지가 있으신가요?`,
          messageId: 'allergies',
        });
      } else if (inquiryStep === 'allergies') {
        setConversationState({ ...conversationState, allergies: inputValue });
        setInquiryStep('additional');
        newMessages.push({
          type: 'ai',
          text: `알러지 정보 확인했습니다. 마지막으로 더 요청하실 사항이 있으신가요?`,
          messageId: 'additional',
        });
      } else if (inquiryStep === 'additional') {
        setConversationState({ ...conversationState, additionalRequests: inputValue });
        setInquiryStep('complete');
        newMessages.push({
          type: 'ai',
          text: `상담 내용을 모두 확인했습니다! 이대로 예약을 신청할까요?`,
          options: ['예약 신청하기', '내용 수정하기'],
          messageId: 'finalConfirm',
        });
      }
    } else {
      const lowerInput = inputValue.toLowerCase();
      if (lowerInput.includes('디자인') || lowerInput.includes('추천')) {
        const selectedImages = SAMPLE_CAKE_IMAGES.slice(0, 5);
        newMessages.push({
          type: 'ai',
          text: `"${inputValue}" 키워드에 어울리는 디자인을 찾아봤어요!`,
          images: selectedImages,
        });
      } else {
        newMessages.push({
          type: 'ai',
          text: `"${inputValue}"에 대해 무엇을 도와드릴까요?`,
        });
      }
    }

    setMessages(newMessages);
    setInputValue('');
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(SCREEN_HEIGHT - FULL_HEIGHT, event.translationY + context.value);
    })
    .onEnd((event) => {
      if (event.translationY > 50 || event.velocityY > 500) {
        if (sheetState === 'full') runOnJS(setSheetState)('half');
        else if (sheetState === 'half') runOnJS(setSheetState)('closed');
      } else if (event.translationY < -50 || event.velocityY < -500) {
        if (sheetState === 'closed') runOnJS(setSheetState)('half');
        else if (sheetState === 'half') runOnJS(setSheetState)('full');
      } else {
        if (sheetState === 'closed') translateY.value = withSpring(SCREEN_HEIGHT - CLOSED_HEIGHT);
        else if (sheetState === 'half') translateY.value = withSpring(SCREEN_HEIGHT - HALF_HEIGHT);
        else if (sheetState === 'full') translateY.value = withSpring(SCREEN_HEIGHT - FULL_HEIGHT);
      }
    });

  const rSheetStyle = useAnimatedStyle(() => {
    // Offset the sheet upwards by the keyboard height
    const keyboardOffset = keyboard.height.value;
    return {
      transform: [
        { translateY: translateY.value - keyboardOffset }
      ],
    };
  });

  const rBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateY.value,
        [SCREEN_HEIGHT - CLOSED_HEIGHT, SCREEN_HEIGHT - HALF_HEIGHT],
        [0, 1],
        Extrapolation.CLAMP
      ),
      display: translateY.value > SCREEN_HEIGHT - CLOSED_HEIGHT - 10 ? 'none' : 'flex',
    };
  });

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.type === 'user';
    return (
      <View style={[styles.messageContainer, isUser ? styles.userContainer : styles.aiContainer]}>
        {!isUser && item.type !== 'system' && (
          <View style={styles.aiAvatar}><Sparkles size={16} color="white" /></View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
          {item.images && (
            <View style={styles.imagesContainer}>
              <ImageSlider images={item.images} onInquiry={(img) => {
                setConversationState({ ...conversationState, selectedCakeImage: img });
                setChatMode('inquiry');
                setShowReminder(true);
              }} />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <Animated.View style={[styles.backdrop, rBackdropStyle]} pointerEvents="none" />
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheet, rSheetStyle]} pointerEvents="box-none">
          <View style={styles.sheetContent} pointerEvents="auto">
            <View style={styles.dragHandleContainer}><View style={styles.dragHandle} /></View>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.headerIcon}><Sparkles size={20} color="white" /></View>
                <View>
                  <Text style={styles.headerTitle}>AI 케이크 플래너</Text>
                  <Text style={styles.headerSubtitle}>{chatMode === 'inquiry' ? '상담 중' : '무엇이든 물어보세요'}</Text>
                </View>
              </View>
              {sheetState !== 'closed' && (
                <TouchableOpacity onPress={() => { setSheetState('closed'); resetChat(); }}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {sheetState === 'closed' ? (
              <TouchableOpacity onPress={() => setSheetState('half')} style={[styles.collapsedSearch, { marginBottom: tabBarHeight + 10 }]}>
                <Sparkles size={18} color={theme.colors.primary} />
                <Text style={styles.collapsedPlaceholder}>디자인 추천이나 궁금한 점을 말씀해주세요</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }}>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={(_, index) => index.toString()}
                  contentContainerStyle={styles.messagesList}
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps="handled"
                />
                <View style={[styles.inputWrapper, { paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : 10 }]}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      value={inputValue}
                      onChangeText={setInputValue}
                      placeholder="내용을 입력해주세요..."
                      style={styles.input}
                      onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}><Send size={18} color="white" /></TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 },
  bottomSheet: { position: 'absolute', left: 0, right: 0, height: FULL_HEIGHT, zIndex: 100 },
  sheetContent: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 20 },
  dragHandleContainer: { alignItems: 'center', paddingVertical: 12 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  headerSubtitle: { fontSize: 12, color: '#888' },
  collapsedSearch: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F8F8F8', borderRadius: 25, borderWidth: 1, borderColor: '#EEE', gap: 10 },
  collapsedPlaceholder: { fontSize: 14, color: '#AAA', flex: 1 },
  messagesList: { padding: 20 },
  messageContainer: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  userContainer: { alignSelf: 'flex-end' },
  aiContainer: { alignSelf: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#F0F0F0', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: 'white' },
  aiText: { color: '#333' },
  inputWrapper: { paddingTop: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, paddingHorizontal: 16, backgroundColor: '#F8F8F8', borderRadius: 25, borderWidth: 1, borderColor: theme.colors.primary },
  input: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 10 },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  imagesContainer: { marginTop: 10 },
});
