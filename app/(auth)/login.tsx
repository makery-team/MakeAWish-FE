import { useAuth } from "@/hooks/use-auth";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Heart, Sparkles } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");
WebBrowser.maybeCompleteAuthSession();

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

const GoogleGLogo = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <Path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <Path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <Path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
    <Path fill="none" d="M0 0h48v48H0z" />
  </Svg>
);

const IS_MOCK = true; // 개발 및 테스트를 위해 true로 설정. 실제 API 적용 시 false로 변경.

const Particle = ({
  delay,
  startPos,
}: {
  delay: number;
  startPos: { x: number; y: number };
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withDelay(
        delay,
        withTiming(-100 - Math.random() * 100, {
          duration: 3000 + Math.random() * 2000,
          easing: Easing.out(Easing.quad),
        }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(0.6, { duration: 1000 }),
          withTiming(0, { duration: 1000 }),
        ),
      ),
      -1,
      false,
    );
    scale.value = withRepeat(
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 2000 }),
        ),
      ),
      -1,
      false,
    );
  }, [delay]); // useSharedValue는 안정적인 참조이므로 의존성 배열에서 제외

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
    left: startPos.x,
    top: startPos.y,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Sparkles size={12} color="#D88A80" fill="#D88A80" />
    </Animated.View>
  );
};

const CakeIllustration = () => (
  <View style={styles.cakeScene}>
    <View style={styles.cakeGlow} />
    <View style={styles.sparkleOrbTopLeft}>
      <Sparkles size={12} color="#E7A55C" fill="#E7A55C" />
    </View>
    <View style={styles.sparkleOrbTopRight}>
      <Sparkles size={12} color="#E7A55C" fill="#E7A55C" />
    </View>
    <View style={styles.heartOrbLeft}>
      <Heart size={14} color="#C86A72" fill="#C86A72" />
    </View>
    <View style={styles.heartOrbRight}>
      <Heart size={12} color="#C86A72" fill="#C86A72" />
    </View>
    <View style={styles.cakePole} />
    <View style={styles.cakeStar}>
      <Sparkles size={20} color="#FFE9A8" fill="#FFE9A8" />
    </View>
    <View style={styles.cakeBottomCloud} />
    <View style={styles.cakeBottomTier}>
      <View style={styles.cakeBottomFrosting} />
      <View style={styles.cakeBottomCream} />
    </View>
    <View style={styles.cakeTopTier}>
      <View style={styles.cakeTopFrosting} />
      <View style={styles.cakeTopCream} />
    </View>
  </View>
);

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const logoScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [logoScale]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  // 로그인 성공 및 유저 정보 업데이트 시 화면 이동
  useEffect(() => {
    if (user) {
      // 닉네임이나 전화번호가 없으면 신규 유저로 간주하여 회원가입(추가정보 입력) 페이지로 이동
      if (!user.nickname || !user.phoneNumber) {
        router.replace("/(auth)/signup");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert(
        "로그인 실패",
        "Google 로그인 중 오류가 발생했습니다. 다시 시도해 주세요."
      );
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isGoogleDisabled = isGoogleLoading;

  return (
    <View style={styles.container}>
      <View style={styles.bgGlowTopLeft} />
      <View style={styles.bgGlowTopRight} />
      <View style={styles.bgGlowBottomLeft} />

      <Particle delay={0} startPos={{ x: width * 0.18, y: height * 0.26 }} />
      <Particle delay={700} startPos={{ x: width * 0.76, y: height * 0.2 }} />
      <Particle delay={1400} startPos={{ x: width * 0.62, y: height * 0.42 }} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.heroSection, logoAnimatedStyle]}>
            <CakeIllustration />

            <View style={styles.titleBlock}>
              <Text style={styles.appName}>Make a Wish</Text>
              <Text style={styles.appSubtitle}>AI Custom Cake Platform</Text>
              <Text style={styles.appDescription}>
                특별한 날의 케이크를 더 예쁘고, 더 쉽게.
              </Text>
            </View>
          </Animated.View>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.googleBrandedButton,
                isGoogleDisabled && styles.googleBrandedButtonDisabled,
              ]}
              onPress={handleGoogleLogin}
              activeOpacity={0.9}
              disabled={isGoogleDisabled}
            >
              <View style={styles.googleBrandedContentWrapper}>
                <View style={styles.googleBrandedIconWrapper}>
                  <GoogleGLogo size={18} />
                </View>
                {isGoogleLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#1F1F1F"
                    style={styles.googleLoadingIndicator}
                  />
                ) : (
                  <Text style={styles.googleBrandedText}>
                    Sign up with Google
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              가입 시 <Text style={styles.footerLink}>이용약관</Text> 및{" "}
              <Text style={styles.footerLink}>개인정보 처리방침</Text>에
              동의하게 됩니다.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EF" },
  bgGlowTopLeft: {
    position: "absolute",
    top: -height * 0.18,
    left: -width * 0.28,
    width: width * 0.95,
    height: width * 0.95,
    borderRadius: width,
    backgroundColor: "#FFF2DA",
    opacity: 0.95,
  },
  bgGlowTopRight: {
    position: "absolute",
    top: -height * 0.08,
    right: -width * 0.18,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width,
    backgroundColor: "#FCE7E0",
    opacity: 0.9,
  },
  bgGlowBottomLeft: {
    position: "absolute",
    bottom: -height * 0.16,
    left: -width * 0.22,
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width,
    backgroundColor: "#FFF1E5",
    opacity: 0.9,
  },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 28,
    paddingBottom: 28,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 12,
  },
  cakeScene: {
    width: 260,
    height: 240,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    marginBottom: 28,
  },
  cakeGlow: {
    position: "absolute",
    bottom: 18,
    width: 220,
    height: 100,
    borderRadius: 120,
    backgroundColor: "#FFE9CB",
    opacity: 0.55,
  },
  cakeBottomCloud: {
    position: "absolute",
    bottom: 0,
    width: 210,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#E5B5A8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  cakeBottomTier: {
    position: "absolute",
    bottom: 36,
    width: 206,
    height: 64,
    borderRadius: 30,
    backgroundColor: "#D96E72",
    shadowColor: "#B76161",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  cakeBottomFrosting: {
    position: "absolute",
    top: 14,
    left: 10,
    right: 10,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#E98785",
  },
  cakeBottomCream: {
    position: "absolute",
    top: 24,
    left: 0,
    right: 0,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F8D9C2",
  },
  cakeTopTier: {
    position: "absolute",
    bottom: 90,
    width: 156,
    height: 54,
    borderRadius: 26,
    backgroundColor: "#DA7072",
    shadowColor: "#B76161",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  cakeTopFrosting: {
    position: "absolute",
    top: 12,
    left: 8,
    right: 8,
    height: 14,
    borderRadius: 8,
    backgroundColor: "#E08A84",
  },
  cakeTopCream: {
    position: "absolute",
    top: 22,
    left: 0,
    right: 0,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F8D5BC",
  },
  cakePole: {
    position: "absolute",
    bottom: 136,
    width: 8,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#DFA772",
  },
  cakeStar: {
    position: "absolute",
    bottom: 158,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFE8B9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E8B35A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sparkleOrbTopLeft: { position: "absolute", top: 34, left: 54, opacity: 0.65 },
  sparkleOrbTopRight: {
    position: "absolute",
    top: 46,
    right: 48,
    opacity: 0.65,
  },
  heartOrbLeft: { position: "absolute", top: 92, left: 24, opacity: 0.55 },
  heartOrbRight: { position: "absolute", top: 106, right: 22, opacity: 0.55 },
  titleBlock: { alignItems: "center" },
  appName: {
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "900",
    color: "#C95D61",
    letterSpacing: -1.4,
    textAlign: "center",
    textShadowColor: "rgba(236, 171, 112, 0.55)",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 12,
  },
  appSubtitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#8D4A4C",
    textAlign: "center",
  },
  appDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#9A6D61",
    textAlign: "center",
    paddingHorizontal: 12,
    maxWidth: 280,
  },
  bottomSection: { width: "100%", alignItems: "center", gap: 14 },
  googleBrandedButton: {
    backgroundColor: "#FFFFFF",
    height: 40,
    borderWidth: 1,
    borderColor: "#747775",
    borderRadius: 20,
    paddingHorizontal: 12,
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
  },
  googleBrandedButtonDisabled: {
    backgroundColor: "#FFFFFF61",
    borderColor: "#1F1F1F1F",
  },
  googleBrandedContentWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    position: "relative",
  },
  googleBrandedIconWrapper: {
    width: 20,
    height: 20,
    minWidth: 20,
    marginRight: 10,
  },
  googleBrandedText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F1F1F",
    fontFamily: Platform.select({
      ios: "Roboto",
      android: "Roboto",
      default: "Roboto, Arial, sans-serif",
    }),
    letterSpacing: 0.25,
  },
  googleLoadingIndicator: { marginLeft: 2 },
  footerText: {
    fontSize: 12,
    color: "rgba(141, 74, 76, 0.78)",
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: { textDecorationLine: "underline", fontWeight: "700" },
  particle: { position: "absolute", zIndex: 1, opacity: 0.55 },
});
