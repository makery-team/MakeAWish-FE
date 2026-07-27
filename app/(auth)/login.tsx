import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
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
import Svg, { Path } from "react-native-svg";
import { theme } from "@/constants/theme";

const { width } = Dimensions.get("window");

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

const IS_MOCK = false;

const OwnerSplashGraphic = () => (
  <View style={styles.graphicContainer}>
    <View style={styles.graphicCircle}>
      <Text style={styles.emojiCenter}>🍰</Text>
      <Text style={styles.emojiRight}>✨</Text>
      <Text style={styles.emojiLeft}>🧁</Text>
    </View>
  </View>
);

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 리다이렉트 로직은 렌더링 중 실행되지 않도록 useEffect 내에서 실행
  useEffect(() => {
    if (user && user.nickname && user.phoneNumber) {
      router.replace("/(tabs)");
    } else if (user) {
      router.replace("/(auth)/signup");
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      if (IS_MOCK) {
        setTimeout(() => {
          Alert.alert("알림", "모의 로그인은 작동하지 않습니다.");
          setIsGoogleLoading(false);
        }, 1000);
        return;
      }
      await signInWithGoogle();
    } catch (error) {
      Alert.alert("로그인 오류", "Google 로그인을 완료할 수 없습니다.");
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const isGoogleDisabled = isGoogleLoading;

  return (
    <View style={styles.container}>
      {/* Background Glow Effects to match Owner App exactly */}
      <View style={styles.bgGlowYellow} />
      <View style={styles.bgGlowLavender} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ 특별한 하루를 위한</Text>
            </View>
            <Text style={styles.appName}>
              달콤한 주문,{"\n"}한눈에 확인해요
            </Text>
            <Text style={styles.appDescription}>
              케이크 탐색부터 주문 접수까지 소비자 전용 앱
            </Text>
            <OwnerSplashGraphic />
          </View>

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
                    Sign in with Google
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              로그인 시 <Text style={styles.footerLink}>이용약관</Text> 및{" "}
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
  container: { flex: 1, backgroundColor: theme.colors.background, position: 'relative' },
  bgGlowYellow: {
    position: "absolute",
    top: 40,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFF2DA",
    opacity: 0.6,
  },
  bgGlowLavender: {
    position: "absolute",
    top: 120,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#EBE5F7",
    opacity: 0.6,
  },
  safeArea: { flex: 1, zIndex: 10 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontFamily: "GowunDodum_400Regular",
  },
  appName: {
    fontSize: 34,
    lineHeight: 44,
    color: theme.colors.primary,
    fontFamily: "GowunDodum_400Regular",
    textAlign: "center",
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontFamily: "GowunDodum_400Regular",
    textAlign: "center",
    marginBottom: 40,
  },
  graphicContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
  },
  graphicCircle: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: theme.colors.surface,
    borderRadius: width,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  emojiCenter: {
    fontSize: 100,
    lineHeight: 110,
  },
  emojiRight: {
    position: "absolute",
    right: -10,
    top: 20,
    fontSize: 40,
  },
  emojiLeft: {
    position: "absolute",
    left: -10,
    bottom: 20,
    fontSize: 40,
  },
  bottomSection: { width: "100%", alignItems: "center", gap: 16 },
  googleBrandedButton: {
    backgroundColor: "#FFFFFF",
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0", // softer border to match the elegant style while keeping it a border
    borderRadius: 24,
    paddingHorizontal: 16,
    overflow: "hidden",
    alignSelf: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleBrandedButtonDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  googleBrandedContentWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  googleBrandedIconWrapper: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleBrandedText: {
    fontSize: 16,
    color: "#334155",
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
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "GowunDodum_400Regular",
  },
  footerLink: { textDecorationLine: "underline" },
});
