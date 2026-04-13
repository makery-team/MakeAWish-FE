import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ChevronRight, Send, Sparkles, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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

import { INITIAL_AI_MESSAGE } from "@/constants/mock-data";
import { theme } from "@/constants/theme";
import type { ChatMode, InquiryMode, Message, OrderData } from "@/types";
import { ImageSlider } from "./image-slider";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
export const COLLAPSED_BAR_HEIGHT = 64;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

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
  const tabBarHeightFromNavigator = useBottomTabBarHeight();
  const tabBarHeight =
    tabBarHeightFromNavigator > 0
      ? tabBarHeightFromNavigator
      : insets.bottom + 60;

  // Snap Points
  const FULL_Y = 0;
  const HALF_Y = SHEET_HEIGHT * 0.45;
  const CLOSED_Y = SHEET_HEIGHT - (tabBarHeight + COLLAPSED_BAR_HEIGHT);

  const [sheetState, setSheetState] = useState<"closed" | "half" | "full">(
    "closed",
  );
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([INITIAL_AI_MESSAGE]);
  const [chatMode, setChatMode] = useState<ChatMode>("search");
  const flatListRef = useRef<FlatList>(null);

  const translateY = useSharedValue(CLOSED_Y);
  const context = useSharedValue(0);

  // Helper to sync state safely
  const syncState = (pos: number) => {
    "worklet";
    if (pos <= FULL_Y + 50) runOnJS(setSheetState)("full");
    else if (pos <= HALF_Y + 50) runOnJS(setSheetState)("half");
    else runOnJS(setSheetState)("closed");
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateY.value;
    })
    .onUpdate((event) => {
      // Clamp values strictly to prevent out-of-bounds crashes
      translateY.value = Math.max(
        FULL_Y,
        Math.min(CLOSED_Y, event.translationY + context.value),
      );
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const currentPos = translateY.value;

      let targetY = CLOSED_Y;
      if (velocity < -500) {
        targetY = currentPos > HALF_Y ? HALF_Y : FULL_Y;
      } else if (velocity > 500) {
        targetY = currentPos < HALF_Y ? HALF_Y : CLOSED_Y;
      } else {
        const distFull = Math.abs(currentPos - FULL_Y);
        const distHalf = Math.abs(currentPos - HALF_Y);
        const distClosed = Math.abs(currentPos - CLOSED_Y);
        const minDist = Math.min(distFull, distHalf, distClosed);

        if (minDist === distFull) targetY = FULL_Y;
        else if (minDist === distHalf) targetY = HALF_Y;
        else targetY = CLOSED_Y;
      }

      translateY.value = withSpring(targetY, { damping: 20, stiffness: 90 });
      syncState(targetY);
    });

  const rSheetStyle = useAnimatedStyle(() => {
    // Manually handle keyboard to avoid KeyboardAvoidingView conflicts
    const kHeight = keyboard.height.value;
    return {
      transform: [
        {
          translateY:
            translateY.value - (translateY.value < CLOSED_Y ? kHeight : 0),
        },
      ],
    };
  });

  const rBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [CLOSED_Y, HALF_Y],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const rFullContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [CLOSED_Y, CLOSED_Y - 50],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const rCollapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [CLOSED_Y, CLOSED_Y - 50],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const handleOpen = useCallback(
    (mode: "half" | "full" = "half") => {
      const targetY = mode === "half" ? HALF_Y : FULL_Y;
      translateY.value = withSpring(targetY);
      setSheetState(mode);
    },
    [FULL_Y, HALF_Y, translateY],
  );

  const resetChat = () => {
    Keyboard.dismiss();
    setSheetState("closed");
    translateY.value = withSpring(CLOSED_Y);
    setTimeout(() => {
      setMessages([INITIAL_AI_MESSAGE]);
      setChatMode("search");
      setInputValue("");
    }, 300);
  };

  useEffect(() => {
    if (inquiryMode?.active) {
      setChatMode("inquiry");
      handleOpen("full");
    }
  }, [handleOpen, inquiryMode]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [
      ...prev,
      { type: "user", text: inputValue } as Message,
    ]);
    const currentInput = inputValue;
    setInputValue("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: `"${currentInput}"에 대해 확인했습니다. 더 궁금하신 점이 있나요?`,
        } as Message,
      ]);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 600);
  };

  return (
    <>
      <Animated.View
        style={[styles.backdrop, rBackdropStyle]}
        pointerEvents="none"
      />
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.sheet, rSheetStyle]}>
          {/* Drag handle is always at the top of the sheet */}
          <View style={styles.dragHandleArea}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.container}>
            {/* Collapsed View: Visible only when near CLOSED_Y */}
            <Animated.View
              style={[styles.collapsedWrapper, rCollapsedStyle]}
              pointerEvents={sheetState === "closed" ? "auto" : "none"}
            >
              <TouchableOpacity
                style={styles.collapsedBar}
                onPress={() => handleOpen("half")}
                activeOpacity={0.9}
              >
                <View style={styles.collapsedLeft}>
                  <View style={styles.collapsedIcon}>
                    <Sparkles size={18} color="white" />
                  </View>
                  <Text style={styles.collapsedTitle}>
                    AI 케이크 플래너에게 물어보기
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.gray} />
              </TouchableOpacity>
            </Animated.View>

            {/* Full Content: Visible when opened */}
            <Animated.View
              style={[styles.fullContent, rFullContentStyle]}
              pointerEvents={sheetState !== "closed" ? "auto" : "none"}
            >
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>AI 케이크 플래너</Text>
                  <Text style={styles.headerSubtitle}>
                    {chatMode === "inquiry"
                      ? "상담 진행 중"
                      : "무엇이든 물어보세요"}
                  </Text>
                </View>
                <TouchableOpacity onPress={resetChat} style={styles.closeBtn}>
                  <X size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.msgRow,
                      item.type === "user" ? styles.userRow : styles.aiRow,
                    ]}
                  >
                    {item.type === "ai" && (
                      <View style={styles.aiIcon}>
                        <Sparkles size={12} color="white" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        item.type === "user"
                          ? styles.userBubble
                          : styles.aiBubble,
                      ]}
                    >
                      <Text
                        style={[
                          styles.msgText,
                          item.type === "user"
                            ? styles.userText
                            : styles.aiText,
                        ]}
                      >
                        {item.text}
                      </Text>
                      {item.images && (
                        <View style={{ marginTop: 8 }}>
                          <ImageSlider
                            images={item.images}
                            onCakeSelect={onCakeSelect}
                            onInquiry={(image) => {
                              onInquiryComplete?.({
                                cakeImage: image,
                                shopName: inquiryMode?.shopName,
                              });
                              resetChat();
                            }}
                            onMinimize={resetChat}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                )}
                keyExtractor={(_, i) => i.toString()}
                contentContainerStyle={styles.chatList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                keyboardShouldPersistTaps="handled"
              />

              <View
                style={[
                  styles.inputArea,
                  {
                    paddingBottom:
                      tabBarHeight + (Platform.OS === "ios" ? 8 : 16),
                  },
                ]}
              >
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="원하는 디자인을 설명해주세요"
                    value={inputValue}
                    onChangeText={setInputValue}
                    onSubmitEditing={handleSend}
                    autoFocus={false}
                  />
                  <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                    <Send size={18} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 99,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 25,
    zIndex: 1000,
  },
  container: { flex: 1, position: "relative" },
  dragHandleArea: {
    width: "100%",
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },

  collapsedWrapper: {
    ...StyleSheet.absoluteFillObject,
    height: COLLAPSED_BAR_HEIGHT + 32,
  },
  collapsedBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: COLLAPSED_BAR_HEIGHT,
  },
  collapsedLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  collapsedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  collapsedTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.text },

  fullContent: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.text },
  headerSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  closeBtn: { padding: 8, backgroundColor: "#F9FAFB", borderRadius: 12 },

  chatList: { padding: 20, paddingBottom: 10 },
  msgRow: { flexDirection: "row", marginBottom: 16, maxWidth: "85%" },
  userRow: { alignSelf: "flex-end" },
  aiRow: { alignSelf: "flex-start" },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 4,
  },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: { backgroundColor: "#F3F4F6", borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22 },
  userText: { color: "white", fontWeight: "500" },
  aiText: { color: "#374151" },

  inputArea: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15 },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
