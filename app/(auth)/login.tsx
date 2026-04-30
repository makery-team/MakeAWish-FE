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
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <G>
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
    // [MOCK LOGIN FOR PROTOTYPE]
    // Since we are in the prototyping phase, we bypass the real Google OAuth
    // to avoid 404 errors with dummy Client IDs.
    setIsGoogleLoading(true);
    
    setTimeout(() => {
      signIn({
        id: 'mock-user-123',
        email: 'test@example.com',
        nickname: '지니테스터',
        phoneNumber: '',
        language: '',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      });
      setIsGoogleLoading(false);
      router.replace('/(auth)/signup');
    }, 1000);

    /* 
    // REAL OAUTH LOGIC (Disable for now)
    if (!request) {
      Alert.alert('설정 필요', 'Google Client ID가 설정되지 않았거나 인증 요청이 아직 준비되지 않았습니다.');
      return;
    }

    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } finally {
      setIsGoogleLoading(false);
    }
    */
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
