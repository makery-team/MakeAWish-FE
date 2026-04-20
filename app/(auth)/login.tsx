import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { theme } from '@/constants/theme';
import { Globe as Google, Sparkles } from 'lucide-react-native';
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

  // Logo animation
  const logoScale = useSharedValue(1);
  const logoRotate = useSharedValue(0);

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
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` }
    ],
  }));

  const handleGoogleLogin = () => {
    signIn({ 
      id: '123', 
      email: 'user@example.com',
      nickname: '',
      phoneNumber: '',
      language: ''
    });
    router.replace('/(auth)/signup');
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
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleGoogleLogin}
              activeOpacity={0.9}
            >
              <View style={styles.googleIconBg}>
                <Google color="#EA4335" size={20} />
              </View>
              <Text style={styles.googleButtonText}>Google로 로그인</Text>
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
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 24,
  },
  googleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 48, // Balance the icon
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
