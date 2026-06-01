import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ChevronRight, LayoutGrid, List, Send, Sparkles, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector, FlatList } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { INITIAL_AI_MESSAGE } from "@/constants/mock-data";
import { theme } from "@/constants/theme";
import { useInquiry } from "@/hooks/use-inquiry";
import { aiService } from "@/services/ai";
import type { ChatMode, InquiryMode, Message, OrderData } from "@/types";
import { ImageSlider } from "./image-slider";
import { OrderReminderCard } from "./order-reminder-card";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// --- 최적화된 상수 설정 ---
export const COLLAPSED_BAR_HEIGHT = 72; // 90에서 72로 축소하여 더 슬림하게 변경
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const HANDLE_HEIGHT = 24; // 핸들 영역도 약간 줄임

interface AISearchBarProps {
  onCakeSelect?: (image: string, shopName: string) => void;
  inquiryMode?: InquiryMode | null;
  onInquiryComplete?: (orderData?: OrderData) => void;
}

export function AISearchBar({
  onCakeSelect,
  inquiryMode,
  onInquiryComplete,
}: AISearchBarProps) {
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const { conversationHistory, updateConversation, resetConversation } = useInquiry();
  const tabBarHeightFromNavigator = useBottomTabBarHeight();
  const tabBarHeight = tabBarHeightFromNavigator > 0 ? tabBarHeightFromNavigator : insets.bottom + 60;

  // Snap Points
  const FULL_Y = 0;
  const HALF_Y = SHEET_HEIGHT * 0.45;
  const CLOSED_Y = SHEET_HEIGHT - (tabBarHeight + COLLAPSED_BAR_HEIGHT);

  const [sheetState, setSheetState] = useState<"closed" | "half" | "full">("closed");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([INITIAL_AI_MESSAGE]);
  const [chatMode, setChatMode] = useState<ChatMode>("search");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [currentStoreSchema, setCurrentStoreSchema] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  const translateY = useSharedValue(CLOSED_Y);
  const context = useSharedValue(0);

  const syncState = (pos: number) => {
    "worklet";
    if (pos <= FULL_Y + 100) runOnJS(setSheetState)("full");
    else if (pos <= HALF_Y + 100) runOnJS(setSheetState)("half");
    else runOnJS(setSheetState)("closed");
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(FULL_Y, Math.min(CLOSED_Y, event.translationY + context.value));
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const currentPos = translateY.value;
      let targetY = CLOSED_Y;

      if (velocity < -500) { targetY = currentPos > HALF_Y ? HALF_Y : FULL_Y; }
      else if (velocity > 500) { targetY = currentPos < HALF_Y ? HALF_Y : CLOSED_Y; }
      else {
        const distFull = Math.abs(currentPos - FULL_Y);
        const distHalf = Math.abs(currentPos - HALF_Y);
        const distClosed = Math.abs(currentPos - CLOSED_Y);
        const minDist = Math.min(distFull, distHalf, distClosed);
        if (minDist === distFull) targetY = FULL_Y;
        else if (minDist === distHalf) targetY = HALF_Y;
        else targetY = CLOSED_Y;
      }

      translateY.value = withSpring(targetY, { damping: 25, stiffness: 120 });
      syncState(targetY);
    });

  const rSheetStyle = useAnimatedStyle(() => {
    const kHeight = keyboard.height.value;
    return { transform: [{ translateY: translateY.value - (translateY.value < CLOSED_Y ? kHeight : 0) }] };
  });

  const rBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [CLOSED_Y, HALF_Y], [0, 1], Extrapolation.CLAMP),
  }));

  const rFullContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [CLOSED_Y, CLOSED_Y - 60], [0, 1], Extrapolation.CLAMP),
    display: translateY.value > CLOSED_Y - 20 ? 'none' : 'flex'
  }));

  const rCollapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [CLOSED_Y, CLOSED_Y - 60], [1, 0], Extrapolation.CLAMP),
    display: translateY.value < CLOSED_Y - 60 ? 'none' : 'flex'
  }));

  const handleOpen = useCallback((mode: "half" | "full" = "half") => {
    const targetY = mode === "half" ? HALF_Y : FULL_Y;
    translateY.value = withSpring(targetY);
    setSheetState(mode);
  }, [FULL_Y, HALF_Y, translateY]);

  const resetChat = () => {
    Keyboard.dismiss();
    setSheetState("closed");
    translateY.value = withSpring(CLOSED_Y);
    setTimeout(() => {
      setMessages([INITIAL_AI_MESSAGE]);
      setChatMode("search");
      setInputValue("");
      setCurrentStoreSchema(null);
      resetConversation();
    }, 300);
  };

  useEffect(() => {
    if (inquiryMode?.active) {
      setChatMode("inquiry");
      handleOpen("full");
      updateConversation({ selectedCakeImage: inquiryMode.image, shopName: inquiryMode.shopName });
      
      // 백엔드가 오케스트레이션을 하므로 여기서 스키마를 찔러볼 필요가 없습니다.
      // 필요 시 봇에게 초기 메시지를 던지게 할 수 있습니다.
    }
  }, [handleOpen, inquiryMode, updateConversation]);

  const toggleViewMode = (index: number) => {
    setMessages((prev) => {
      const newMsgs = [...prev];
      if (newMsgs[index]) {
        const currentMode = newMsgs[index].viewMode || 'slider';
        newMsgs[index] = { ...newMsgs[index], viewMode: currentMode === 'slider' ? 'grid' : 'slider' };
      }
      return newMsgs;
    });
  };

  const handleSend = async (overrideValue?: string) => {
    const textToSend = overrideValue || inputValue;
    if (!textToSend.trim()) return;
    const newUserMsg: Message = { type: "user", text: textToSend };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsAiTyping(true);
    try {
      // 오직 백엔드와 통신 (오케스트레이터 패턴)
      const response = await aiService.chat(textToSend);
      
      let recommendedImages: string[] | undefined = undefined;
      let recommendedCakeDetails: { image: string, shopName: string }[] | undefined = undefined;
      
      // 백엔드가 포트폴리오 리스트를 내려주는 경우 매핑
      if (response.actionType === 'PORTFOLIO_LIST' && Array.isArray(response.data)) {
        recommendedCakeDetails = response.data.map((p: any) => ({ 
          image: p.imageUrl, 
          shopName: p.storeName || '지니 추천',
          portfolioId: p.id,
          storeId: p.storeId,
          productId: p.productId
        }));
        recommendedImages = recommendedCakeDetails.map(c => c.image);
      }
      
      // 챗봇 응답 메시지 구성
      const newAiMsg: Message = { 
        type: "ai", 
        text: response.message, 
        options: response.data?.options || undefined, 
        images: recommendedImages, 
        cakeDetails: recommendedCakeDetails, 
        viewMode: 'slider',
        actionType: response.actionType,
        slots: response.data?.extracted_slots || response.data?.slots,
        totalPrice: response.data?.totalPrice
      };
      
      setMessages((prev) => [...prev, newAiMsg]);

      // 스키마/주문 정보 업데이트 (에이전트가 알려주는 상태 유지)
      if (response.data?.slots || response.data?.extracted_slots) {
        updateConversation(response.data.slots || response.data.extracted_slots);
      }

      if (response.actionType === 'ORDER_COMPLETE') {
        setTimeout(() => {
          onInquiryComplete?.({ 
            cakeImage: conversationHistory.selectedCakeImage || "", 
            shopName: conversationHistory.shopName, 
            portfolioId: conversationHistory.portfolioId,
            storeId: conversationHistory.storeId,
            productId: conversationHistory.productId,
            ...conversationHistory
          });
          resetChat();
        }, 1500);
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [...prev, { type: "ai", text: "죄송합니다. 백엔드 통신 중 오류가 발생했습니다." } as Message]);
    } finally {
      setIsAiTyping(false);
      setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 100);
    }
  };

  const renderMessageItem = ({ item, index }: { item: Message, index: number }) => {
    // 💡 LOCAL_ORDER_REMINDER 카드는 말풍선 없이 넓게 렌더링
    if (item.actionType === 'LOCAL_ORDER_REMINDER' && item.cakeDetails?.[0]) {
      return (
        <View style={[styles.msgRow, styles.aiRow, { marginBottom: 24 }]}>
          <View style={styles.aiIcon}>
            <Sparkles size={12} color="white" strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1, paddingRight: 32 }}>
            <OrderReminderCard 
              conversationState={{
                ...conversationHistory,
                shopName: item.cakeDetails[0].shopName
              }}
              selectedImage={item.cakeDetails[0].image}
              onConfirm={() => {
                const shopName = item.cakeDetails![0].shopName;
                handleSend(`이 시안(${shopName || '지니 추천'})으로 주문 문의할게요!`);
              }}
              onCancel={() => {
                setMessages(prev => prev.filter(m => m !== item));
              }}
            />
          </View>
        </View>
      );
    }

    return (
    <View style={[styles.msgRow, item.type === "user" ? styles.userRow : styles.aiRow]}>
      {item.type === "ai" && <View style={styles.aiIcon}><Sparkles size={12} color="white" strokeWidth={1.5} /></View>}
      <View style={[styles.bubble, item.type === "user" ? styles.userBubble : styles.aiBubble]}>
        <View style={styles.bubbleHeader}>
          <Text style={[styles.msgText, { flexShrink: 1 }, item.type === "user" ? styles.userText : styles.aiText]}>{item.text}</Text>
          {item.type === "ai" && item.images && item.images.length > 0 && (
            <TouchableOpacity onPress={() => toggleViewMode(index)} style={styles.toggleBtn}>
              {item.viewMode === 'grid' ? <List size={14} color={theme.colors.primary} strokeWidth={1.5} /> : <LayoutGrid size={14} color={theme.colors.primary} strokeWidth={1.5} />}
              <Text style={styles.toggleText}>{item.viewMode === 'grid' ? '슬라이드' : '그리드'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {item.options && (
          <View style={styles.optionsContainer}>
            {item.options.map((opt, idx) => (
              <TouchableOpacity key={idx} style={styles.optionChip} onPress={() => handleSend(opt)}><Text style={styles.optionText}>{opt}</Text></TouchableOpacity>
            ))}
          </View>
        )}
        {item.actionType === 'CONFIRM_SLOTS' && item.slots && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>입력하신 내용을 확인해주세요:</Text>
            <View style={styles.slotsList}>
              {Object.entries(item.slots).map(([key, val]) => {
                let emoji = '📌';
                if (key.includes('픽업') || key.includes('날짜')) emoji = '📅';
                else if (key.includes('레터링') || key.includes('문구')) emoji = '✍️';
                else if (key.includes('맛') || key.includes('사이즈')) emoji = '🎂';
                else if (key.includes('알러지')) emoji = '⚠️';
                else if (key.includes('요청')) emoji = '📝';
                return <Text key={key} style={styles.summaryRow}>{emoji} {key}: {String(val)}</Text>;
              })}
            </View>
            <Text style={styles.summaryConfirmText}>이대로 매장에 견적 문의를 보내드릴까요?</Text>
            <TouchableOpacity style={styles.confirmBtnPrimary} onPress={() => handleSend("네, 이대로 문의할게요!")}>
              <Text style={styles.confirmBtnTextPrimary}>이대로 문의하기!</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtnSecondary} onPress={() => handleSend("내용 수정할게요")}>
              <Text style={styles.confirmBtnTextSecondary}>내용 수정하기</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.actionType === 'ORDER_SUMMARY' && item.totalPrice && (
          <View style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>최종 결제 금액</Text>
            <Text style={styles.paymentPrice}>{item.totalPrice.toLocaleString()}원</Text>
            <TouchableOpacity style={styles.paymentBtn} onPress={() => handleSend("결제하기")}>
              <Text style={styles.paymentBtnText}>결제하기</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.images && item.images.length > 0 && (
          <View style={{ marginTop: 12, width: item.viewMode === 'grid' ? '100%' : undefined }}>
            {item.viewMode === 'grid' ? (
              <View style={styles.gridContainer}>
                {item.cakeDetails ? item.cakeDetails.map((cake, imgIdx) => (
                  <TouchableOpacity key={imgIdx} style={styles.gridItem} onPress={() => onCakeSelect?.(cake.image, cake.shopName)}>
                    <Image source={{ uri: cake.image }} style={styles.gridImage} contentFit="cover" />
                    <View style={styles.gridOverlay}><View style={styles.gridEditBtn}><Sparkles size={10} color="white" strokeWidth={1.5} /><Text style={styles.gridBtnText}>편집</Text></View></View>
                  </TouchableOpacity>
                )) : item.images.map((img, imgIdx) => (
                  <TouchableOpacity key={imgIdx} style={styles.gridItem} onPress={() => onCakeSelect?.(img, '지니 추천')}>
                    <Image source={{ uri: img }} style={styles.gridImage} contentFit="cover" />
                    <View style={styles.gridOverlay}><View style={styles.gridEditBtn}><Sparkles size={10} color="white" strokeWidth={1.5} /><Text style={styles.gridBtnText}>편집</Text></View></View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ImageSlider
                images={item.images}
                cakeDetails={item.cakeDetails}
                onCakeSelect={onCakeSelect}
                onInquiry={(image, shopName, portfolioId, storeId, productId) => {
                  // 대화 중 슬라이더에서 문의하기 클릭 시, 챗봇 대화방 안에서 이어가도록 처리
                  updateConversation({ 
                    selectedCakeImage: image, 
                    shopName: shopName || inquiryMode?.shopName || '지니 추천',
                    portfolioId,
                    storeId,
                    productId
                  });
                  
                  // 백엔드로 바로 쏘지 않고, 로컬에 확인 카드 메시지를 띄웁니다.
                  const localReminderMsg: Message = {
                    type: "ai",
                    text: "",
                    actionType: "LOCAL_ORDER_REMINDER" as any,
                    cakeDetails: [{
                      image,
                      shopName: shopName || '지니 추천',
                      portfolioId,
                      storeId,
                      productId
                    }]
                  };
                  setMessages(prev => [...prev, localReminderMsg]);
                  setTimeout(() => { flatListRef.current?.scrollToEnd({ animated: true }); }, 100);
                }}
                onMinimize={resetChat}
              />
            )}
          </View>
        )}
      </View>
    </View>
    );
  };

  return (
    <>
      <Animated.View style={[styles.backdrop, rBackdropStyle]} pointerEvents="none" />
      
      <Animated.View style={[styles.sheet, rSheetStyle]}>
        <GestureDetector gesture={gesture}>
          <View style={StyleSheet.absoluteFill}>
            {/* 1. Drag Handle Area (물리적 최상단) */}
            <View style={styles.dragHandleArea}>
              <View style={styles.dragHandle} />
            </View>

            {/* 2. Full Content View (열린 상태 - half/full에서 터치 가능해야 함) */}
            <Animated.View
              style={[styles.fullContent, rFullContentStyle, { flex: 1 }]}
              pointerEvents={sheetState !== "closed" ? "box-none" : "none"}
            >
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>AI 케이크 플래너</Text>
                  <Text style={styles.headerSubtitle}>{chatMode === "inquiry" ? "상담 진행 중" : "무엇이든 물어보세요"}</Text>
                </View>
                <TouchableOpacity 
                  onPress={resetChat} 
                  style={styles.closeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={20} color="#666" strokeWidth={1.5} />
                </TouchableOpacity>
              </View>

              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(_, i) => i.toString()}
                style={{ flex: 1 }}
                contentContainerStyle={[styles.chatList, { paddingBottom: 150 }]}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={isAiTyping ? (
                  <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.typingText}>AI가 생각 중...</Text>
                  </View>
                ) : null}
              />

              <View style={[styles.inputArea, { paddingBottom: tabBarHeight + (Platform.OS === "ios" ? 8 : 16) }]}>
                <LinearGradient
                  colors={[theme.colors.surface, theme.colors.lightGray]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inputContainerGradient}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="답변을 입력하세요..."
                    value={inputValue}
                    onChangeText={setInputValue}
                    onSubmitEditing={() => handleSend()}
                    placeholderTextColor={theme.colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => handleSend()} style={styles.sendBtnGradient}>
                    <Send size={18} color="white" strokeWidth={1.5} />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* 3. Collapsed Bar (닫힌 상태) */}
            <Animated.View
              style={[styles.collapsedWrapper, rCollapsedStyle]}
              pointerEvents={sheetState === "closed" ? "auto" : "none"}
            >
              <TouchableOpacity style={styles.collapsedBar} onPress={() => handleOpen("half")} activeOpacity={0.9}>
                <View style={styles.collapsedLeft}>
                  <View style={styles.collapsedIcon}><Sparkles size={18} color="white" strokeWidth={1.5} /></View>
                  <Text style={styles.collapsedTitle}>AI 케이크 플래너에게 물어보기</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.gray} strokeWidth={1.5} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </GestureDetector>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 99 },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0, height: SHEET_HEIGHT,
    backgroundColor: theme.colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32,
    shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.08, shadowRadius: 30, elevation: 25, zIndex: 1000,
  },
  dragHandleArea: { 
    width: "100%", height: HANDLE_HEIGHT, alignItems: "center", justifyContent: "center", 
    backgroundColor: theme.colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32 
  },
  dragHandle: { width: 36, height: 4, backgroundColor: theme.colors.border, borderRadius: 2 },
  collapsedWrapper: { position: 'absolute', top: HANDLE_HEIGHT, left: 0, right: 0, height: COLLAPSED_BAR_HEIGHT - HANDLE_HEIGHT },
  collapsedBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, height: '100%' },
  collapsedLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  collapsedIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  collapsedTitle: { fontSize: 14, fontWeight: "600", color: theme.colors.text, letterSpacing: -0.5 },
  fullContent: { position: 'absolute', top: HANDLE_HEIGHT, bottom: 0, left: 0, right: 0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
  headerTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2, letterSpacing: -0.3 },
  closeBtn: { padding: 8, backgroundColor: theme.colors.lightGray, borderRadius: 16 },
  chatList: { padding: 20 },
  msgRow: { flexDirection: "row", marginBottom: 16, width: '100%' },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  aiIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 4, shadowColor: theme.colors.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8 },
  bubble: { paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24, maxWidth: '85%', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  bubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4 },
  toggleText: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: -0.3 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start', marginTop: 12 },
  gridItem: { width: (SCREEN_WIDTH * 0.9 - 68) / 2, aspectRatio: 1, borderRadius: 16, overflow: 'hidden', backgroundColor: theme.colors.lightGray },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.2)' },
  gridEditBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 6, borderRadius: 12 },
  gridBtnText: { fontSize: 10, fontWeight: '700', color: theme.colors.text, letterSpacing: -0.3 },
  userBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 6 },
  aiBubble: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 6 },
  msgText: { fontSize: 15, lineHeight: 24, letterSpacing: -0.5 },
  userText: { color: "white", fontWeight: "500" },
  aiText: { color: theme.colors.text },
  optionsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  optionChip: { backgroundColor: theme.colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.02, shadowRadius: 4 },
  optionText: { fontSize: 14, color: theme.colors.text, fontWeight: "500", letterSpacing: -0.3 },
  typingIndicator: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  typingText: { fontSize: 13, color: theme.colors.textMuted, letterSpacing: -0.3 },
  inputArea: { paddingHorizontal: 20, paddingTop: 16, backgroundColor: theme.colors.background, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
  inputContainerGradient: { flexDirection: "row", alignItems: "center", borderRadius: 32, paddingHorizontal: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.03, shadowRadius: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: theme.colors.text, letterSpacing: -0.5 },
  sendBtnGradient: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", marginLeft: 8, shadowColor: theme.colors.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  summaryCard: { marginTop: 16, backgroundColor: theme.colors.surface, padding: 20, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.04, shadowRadius: 16 },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginBottom: 16, letterSpacing: -0.5 },
  slotsList: { marginBottom: 20, gap: 10 },
  summaryRow: { fontSize: 14, color: theme.colors.text, letterSpacing: -0.3 },
  summaryConfirmText: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 16, lineHeight: 22, letterSpacing: -0.3 },
  confirmBtnPrimary: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginBottom: 10, shadowColor: theme.colors.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 8 },
  confirmBtnTextPrimary: { color: 'white', fontWeight: '600', fontSize: 15, letterSpacing: -0.5 },
  confirmBtnSecondary: { backgroundColor: theme.colors.surface, paddingVertical: 14, borderRadius: 24, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border },
  confirmBtnTextSecondary: { color: theme.colors.textMuted, fontWeight: '600', fontSize: 15, letterSpacing: -0.5 },
  paymentCard: { marginTop: 16, backgroundColor: theme.colors.surface, padding: 24, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.primary, shadowColor: theme.colors.primary, shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.1, shadowRadius: 16 },
  paymentTitle: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 6, textAlign: 'center', letterSpacing: -0.3 },
  paymentPrice: { fontSize: 28, fontWeight: '800', color: theme.colors.text, textAlign: 'center', marginBottom: 20, letterSpacing: -1 },
  paymentBtn: { backgroundColor: theme.colors.text, paddingVertical: 16, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8 },
  paymentBtnText: { color: 'white', fontWeight: '700', fontSize: 16, letterSpacing: -0.5 },
});
