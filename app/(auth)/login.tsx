import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { Sparkles } from 'lucide-react-native';
import Svg, { Path, G } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay,
  withSequence,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
WebBrowser.maybeCompleteAuthSession();

interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

// Custom Google G Logo Component using SVG (Following Branding Guidelines)
const GoogleGLogo = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 18 18">
    <G fill="none" fillRule="evenodd">
      <Path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
        fillRule="nonzero"
      />
      <Path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
        fillRule="nonzero"
      />
      <Path
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="#FBBC05"
        fillRule="nonzero"
      />
      <Path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.961L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
        fill="#EA4335"
        fillRule="nonzero"
      />
      <Path d="M0 0h18v18H0z" />
    </G>
  </Svg>
);

// Floating Particle Component
const Particle = ({ delay, startPos }: { delay: number, startPos: { x: number, y: number } }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withDelay(delay, withTiming(-100 - Math.random() * 100, { duration: 3000 + Math.random() * 2000, easing: Easing.out(Easing.quad) })),
      -1,
      false
    );
    opacity.value = withRepeat(
      withDelay(delay, withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 }),
        withTiming(0, { duration: 1000 })
      )),
      -1,
      false
    );
    scale.value = withRepeat(
      withDelay(delay, withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 2000 })
      )),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
    left: startPos.x,
    top: startPos.y,
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Sparkles size={12} color="#FFF" fill="#FFF" />
    </Animated.View>
  );
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // Logo animation
  const logoScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value }
    ],
  }));

  useEffect(() => {
    if (!response) {
      return;
    }

    if (response.type === 'error') {
      Alert.alert('로그인 실패', 'Google 로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
      return;
    }

    if (response.type !== 'success') {
      return;
    }

    const finishGoogleLogin = async () => {
      const accessToken = response.authentication?.accessToken;

      if (!accessToken) {
        Alert.alert('로그인 실패', 'Google 인증 토큰을 가져오지 못했습니다.');
        return;
      }

      try {
        setIsGoogleLoading(true);
        const userResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch Google profile');
        }

        const profile: GoogleUserInfo = await userResponse.json();
        signIn({
          id: profile.id || profile.email,
          email: profile.email,
          nickname: profile.name ?? '',
          phoneNumber: '',
          language: '',
          profileImage: profile.picture,
        });
        router.replace('/(auth)/signup');
      } catch {
        Alert.alert('로그인 실패', 'Google 계정 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setIsGoogleLoading(false);
      }
    };

    finishGoogleLogin();
  }, [response, router, signIn]);

  const handleGoogleLogin = async () => {
    if (!request) {
      Alert.alert('설정 필요', 'Google Client ID가 설정되지 않았거나 인증 요청이 아직 준비되지 않았습니다.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } finally {
      // response effect에서 성공/실패 상태를 마무리하므로, 취소 케이스만 대비해 false 처리
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradients/Elements */}
      <View style={styles.bgGradient1} />
      <View style={styles.bgGradient2} />
      
      {/* Animated Particles */}
      <Particle delay={0} startPos={{ x: width * 0.2, y: height * 0.4 }} />
      <Particle delay={500} startPos={{ x: width * 0.8, y: height * 0.3 }} />
      <Particle delay={1200} startPos={{ x: width * 0.5, y: height * 0.5 }} />
      <Particle delay={2000} startPos={{ x: width * 0.3, y: height * 0.2 }} />
      <Particle delay={800} startPos={{ x: width * 0.7, y: height * 0.6 }} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>W</Text>
                <Sparkles size={24} color="#FFD700" style={styles.sparkleIcon} />
              </View>
            </View>
            <Text style={styles.appName}>Make A Wish</Text>
            <View style={styles.taglineWrapper}>
              <Text style={styles.tagline}>특별한 날, 가장 빛나는 순간을 위해</Text>
            </View>
          </Animated.View>

          <View style={styles.bottomSection}>
            {/* Google OAuth Button */}
            <TouchableOpacity 
              style={[
                styles.googleBrandedButton,
                (isGoogleLoading || !request) && styles.googleBrandedButtonDisabled,
              ]}
              onPress={handleGoogleLogin}
              activeOpacity={0.9}
              disabled={isGoogleLoading || !request}
            >
              <View style={styles.googleBrandedIconWrapper}>
                <GoogleGLogo size={18} />
              </View>
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#3C4043" style={styles.googleLoadingIndicator} />
              ) : (
                <Text style={styles.googleBrandedText}>Google 계정으로 로그인</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.footerText}>
              가입 시 <Text style={styles.footerLink}>이용약관</Text> 및 <Text style={styles.footerLink}>개인정보 처리방침</Text>에 동의하게 됩니다.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF69B4', // Primary theme color base
  },
  bgGradient1: {
    position: 'absolute',
    top: -height * 0.2,
    right: -width * 0.2,
    width: width * 1.2,
    height: height * 0.6,
    borderRadius: width,
    backgroundColor: '#FF85C0',
    opacity: 0.6,
  },
  bgGradient2: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.3,
    width: width * 1.5,
    height: height * 0.7,
    borderRadius: width,
    backgroundColor: '#7B61FF', // Purple accent
    opacity: 0.4,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingTop: height * 0.15,
    paddingBottom: 50,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    position: 'relative',
  },
  logoText: {
    fontSize: 60,
    fontWeight: '900',
    color: '#FF69B4',
    includeFontPadding: false,
  },
  sparkleIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineWrapper: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  tagline: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '600',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  // Official Google Branded Button Styles
  googleBrandedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 40,
    borderRadius: 2, // Standard is small radius
    paddingLeft: 1, // To accommodate the icon wrapper
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    borderWidth: 1,
    borderColor: '#DADCE0',
    width: 200, // Fixed width common for Google buttons
    marginBottom: 24,
  },
  googleBrandedButtonDisabled: {
    opacity: 0.7,
  },
  googleBrandedIconWrapper: {
    width: 38,
    height: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 1,
  },
  googleBrandedText: {
    fontSize: 14,
    fontWeight: '500', // Medium
    color: '#3C4043',
    fontFamily: Platform.select({ ios: 'Roboto', android: 'Roboto' }),
    paddingLeft: 8,
    paddingRight: 8,
    flex: 1,
    textAlign: 'center',
  },
  googleLoadingIndicator: {
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  particle: {
    position: 'absolute',
    zIndex: 1,
  },
});
