import { theme } from "@/constants/theme";
import { aiService } from "@/services/ai";
import { captureViewToBase64, uriToBase64 } from "@/utils/image-utils";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Brush,
  Eraser,
  Redo,
  Sparkles,
  Undo,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EditorViewProps {
  image: string;
  shopName: string;
  onBack: () => void;
  onInquiry?: (editedImage?: string) => void;
}

interface DrawingPath {
  path: string;
  color: string;
  width: number;
}

export function EditorView({
  image,
  shopName,
  onBack,
  onInquiry,
}: EditorViewProps) {
  const [currentImage, setCurrentImage] = useState(image);
  const [brushSize, setBrushSize] = useState(20);
  const [activeTool, setActiveTool] = useState<"brush" | "eraser">("brush");
  const [command, setCommand] = useState("");
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [redoPaths, setRedoPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  
  const currentPathRef = useRef<string>("");
  const scrollViewRef = useRef<ScrollView>(null);
  const svgContainerRef = useRef<View>(null);

  const containerHeight = SCREEN_WIDTH;

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart((event) => {
      const newPath = `M ${event.x} ${event.y}`;
      currentPathRef.current = newPath;
      setCurrentPath(newPath);
    })
    .onUpdate((event) => {
      const nextPath = `${currentPathRef.current} L ${event.x} ${event.y}`;
      currentPathRef.current = nextPath;
      setCurrentPath(nextPath);
    })
    .onEnd(() => {
      if (!currentPathRef.current.trim()) {
        return;
      }

      const newPath: DrawingPath = {
        path: currentPathRef.current,
        color:
          activeTool === "brush"
            ? "white" // AI 서버 마스크용 (흰색이 칠해진 영역)
            : "black", // 지우개는 검은색으로 (마스크 제외 영역)
        width: brushSize,
      };
      setPaths((prev) => [...prev, newPath]);
      currentPathRef.current = "";
      setCurrentPath("");
      setRedoPaths([]);
    });

  const handleUndo = () => {
    if (paths.length > 0) {
      const lastPath = paths[paths.length - 1];
      setRedoPaths((prev) => [...prev, lastPath]);
      setPaths((prev) => prev.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoPaths.length > 0) {
      const lastRedo = redoPaths[redoPaths.length - 1];
      setPaths((prev) => [...prev, lastRedo]);
      setRedoPaths((prev) => prev.slice(0, -1));
    }
  };

  const handleGenerate = async () => {
    if (!command.trim()) return;
    if (paths.length === 0) {
      Alert.alert("알림", "수정할 영역을 먼저 칠해주세요.");
      return;
    }

    Keyboard.dismiss();
    setIsGenerating(true);

    try {
      // 1. 원본 이미지 Base64 변환
      const imageB64 = await uriToBase64(currentImage);
      
      // 2. 마스크 이미지 캡처 (SVG 영역)
      const maskB64 = await captureViewToBase64(svgContainerRef);

      // 3. AI API 호출
      const response = await aiService.inpaint({
        image_b64: imageB64,
        mask_b64: maskB64,
        prompt: command,
      });

      // 4. 결과 적용
      setCurrentImage(response.result_image);
      setPaths([]); // 편집 완료 후 경로 초기화
      setCommand("");
      Alert.alert("성공", "디자인이 수정되었습니다!");
    } catch (error) {
      console.error("Generation failed:", error);
      Alert.alert("오류", "이미지 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const sparklesStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(withTiming(0.4, { duration: 1000 }), -1, true),
    transform: [
      { scale: withRepeat(withTiming(1.1, { duration: 1000 }), -1, true) },
    ],
  }));

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.safeArea}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>AI 이미지 편집</Text>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => onInquiry?.(currentImage)}
            >
              <Text style={styles.saveButtonText}>완료</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={isKeyboardVisible}
          >
            {/* Canvas Area */}
            <View style={styles.canvasContainer}>
              <Image
                source={{ uri: currentImage }}
                style={[styles.baseImage, { height: containerHeight }]}
                contentFit="cover"
              />

              <GestureDetector gesture={panGesture}>
                <View 
                  ref={svgContainerRef}
                  style={[styles.svgOverlay, { height: containerHeight, backgroundColor: 'black' }]}
                  collapsable={false}
                >
                  <Svg style={StyleSheet.absoluteFill}>
                    {paths.map((p, i) => (
                      <Path
                        key={i}
                        d={p.path}
                        stroke={p.color}
                        strokeWidth={p.width}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                    {currentPath ? (
                      <Path
                        d={currentPath}
                        stroke={activeTool === "brush" ? "white" : "black"}
                        strokeWidth={brushSize}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : null}
                  </Svg>
                </View>
              </GestureDetector>

              {!isGenerating && paths.length === 0 && (
                <View style={styles.hintBadge}>
                  <Text style={styles.hintText}>수정할 부분을 칠해주세요</Text>
                </View>
              )}

              {isGenerating && (
                <View style={styles.loadingOverlay}>
                  <Animated.View style={sparklesStyle}>
                    <Sparkles size={48} color={theme.colors.primary} />
                  </Animated.View>
                  <Text style={styles.loadingTitle}>이미지 생성 중...</Text>
                  <Text style={styles.loadingSubtitle}>
                    AI가 예쁜 디자인을 만들고 있어요
                  </Text>
                </View>
              )}
            </View>

            {/* Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity
                onPress={() => setActiveTool("brush")}
                style={[
                  styles.toolButton,
                  activeTool === "brush" && styles.toolButtonActive,
                ]}
              >
                <Brush
                  size={20}
                  color={activeTool === "brush" ? theme.colors.primary : "#666"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTool("eraser")}
                style={[
                  styles.toolButton,
                  activeTool === "eraser" && styles.toolButtonActive,
                ]}
              >
                <Eraser
                  size={20}
                  color={
                    activeTool === "eraser" ? theme.colors.primary : "#666"
                  }
                />
              </TouchableOpacity>

              <View style={styles.divider} />

              <View style={styles.brushSizeControl}>
                <Text style={styles.sizeLabel}>크기</Text>
                <View style={styles.sizeTrack}>
                  {[10, 20, 30, 40].map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setBrushSize(size)}
                      style={[
                        styles.sizeDot,
                        brushSize === size && styles.sizeDotActive,
                        {
                          width: size / 2 + 4,
                          height: size / 2 + 4,
                          borderRadius: (size / 2 + 4) / 2,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                onPress={handleUndo}
                disabled={paths.length === 0}
                style={[
                  styles.toolButton,
                  paths.length === 0 && styles.toolButtonDisabled,
                ]}
              >
                <Undo size={20} color={paths.length === 0 ? "#CCC" : "#666"} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRedo}
                disabled={redoPaths.length === 0}
                style={[
                  styles.toolButton,
                  redoPaths.length === 0 && styles.toolButtonDisabled,
                ]}
              >
                <Redo
                  size={20}
                  color={redoPaths.length === 0 ? "#CCC" : "#666"}
                />
              </TouchableOpacity>
            </View>

            {/* AI Command Panel */}
            <View style={styles.aiPanel}>
              <Text style={styles.panelTitle}>AI 요청사항</Text>
              <TextInput
                value={command}
                onChangeText={setCommand}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
                placeholder="예: 곰돌이 캐릭터를 추가해줘, 분홍색 리본을 달아줘"
                style={styles.textInput}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity
                onPress={handleGenerate}
                disabled={isGenerating || !command.trim()}
                style={[
                  styles.generateButton,
                  (isGenerating || !command.trim()) &&
                    styles.generateButtonDisabled,
                ]}
              >
                <Sparkles size={20} color="white" />
                <Text style={styles.generateButtonText}>
                  {isGenerating ? "생성 중..." : "이미지 생성하기"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CTA */}
            <TouchableOpacity 
              onPress={() => onInquiry?.(currentImage)} 
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>
                수정된 디자인으로 상담하기
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  canvasContainer: {
    width: "100%",
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  baseImage: {
    width: "100%",
  },
  svgOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  hintBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 30,
    padding: 8,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  toolButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  toolButtonActive: {
    backgroundColor: "#FFF0F5",
  },
  toolButtonDisabled: {
    opacity: 0.5,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#EEE",
    marginHorizontal: 8,
  },
  brushSizeControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  sizeLabel: {
    fontSize: 12,
    color: "#888",
  },
  sizeTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sizeDot: {
    backgroundColor: "#DDD",
  },
  sizeDotActive: {
    backgroundColor: theme.colors.primary,
  },
  aiPanel: {
    marginTop: 24,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#EEE",
    textAlignVertical: "top",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
  },
  ctaButton: {
    backgroundColor: "#333",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 16,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});
