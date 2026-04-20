import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { theme } from '@/constants/theme';
import { Globe as Google } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const handleGoogleLogin = () => {
    // In a real app, this would trigger OAuth
    // Mocking a successful login with partial data
    signIn({ 
      id: '123', 
      email: 'user@example.com',
      nickname: '',
      phoneNumber: '',
      language: ''
    });
    
    // After Google login, we might need to complete signup if fields are missing
    router.replace('/(auth)/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>W</Text>
          </View>
          <Text style={styles.appName}>Make A Wish</Text>
          <Text style={styles.tagline}>당신의 특별한 케이크를 찾으세요</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Google color="#000" size={24} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Google로 계속하기</Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            계속하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 100,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.gray,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: '100%',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
