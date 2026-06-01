import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { theme } from '@/constants/theme';
import { ChevronRight, Phone, User as UserIcon } from 'lucide-react-native';
import { fetchWithAuth } from '@/utils/api';

const LANGUAGES = [
  { label: '한국어', value: 'ko' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
  { label: '中文', value: 'zh' },
];

export default function SignupScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();
  
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [language, setLanguage] = useState('ko');
  const [isLoading, setIsLoading] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  const handleNicknameChange = (text: string) => {
    setNickname(text);
    setIsNicknameAvailable(null);
  };

  // 전화번호 자동 하이픈 및 숫자만 입력되도록 처리
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 3 && cleaned.length <= 7) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length > 7) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
    setPhoneNumber(formatted);
  };

  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }

    try {
      setIsCheckingNickname(true);
      const response = await fetchWithAuth(`/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`);
      
      if (!response.ok) {
        throw new Error('중복 확인 실패');
      }

      const data = await response.json();
      
      if (data.isDuplicate) {
        Alert.alert('사용 불가', '이미 사용중인 닉네임입니다.');
        setIsNicknameAvailable(false);
      } else {
        Alert.alert('사용 가능', '사용 가능한 닉네임입니다.');
        setIsNicknameAvailable(true);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '닉네임 중복 확인 중 문제가 발생했습니다.');
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleComplete = async () => {
    if (!nickname || !phoneNumber) {
      Alert.alert('입력 오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (isNicknameAvailable !== true) {
      Alert.alert('입력 오류', '닉네임 중복 확인을 진행해주세요.');
      return;
    }

    // 전화번호 형식 검증 (010-XXXX-XXXX)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('입력 오류', '올바른 전화번호 형식(010-0000-0000)으로 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      // 백엔드 명세에 맞게 language Enum (KO, EN 등 대문자)로 변환
      const languageEnum = language.toUpperCase();

      const response = await fetchWithAuth('/api/users/me/init', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname,
          phoneNumber,
          language: languageEnum,
        }),
      });

      if (!response.ok) {
        throw new Error('프로필 초기화 실패');
      }

      await updateUser({
        nickname,
        phoneNumber,
        language,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error(error);
      Alert.alert('오류', '프로필 설정 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>추가 정보 입력</Text>
            <Text style={styles.subtitle}>메이크어위시 서비스를 위한 정보를 입력해주세요.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>닉네임</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.inputWrapper, { flex: 1 }]}>
                  <UserIcon size={20} color={theme.colors.gray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="닉네임을 입력하세요"
                    value={nickname}
                    onChangeText={handleNicknameChange}
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.checkButton, (!nickname || isCheckingNickname) && styles.checkButtonDisabled]}
                  onPress={handleCheckNickname}
                  disabled={!nickname || isCheckingNickname}
                >
                  <Text style={styles.checkButtonText}>{isCheckingNickname ? '확인 중' : '중복 확인'}</Text>
                </TouchableOpacity>
              </View>
              {isNicknameAvailable === true && <Text style={styles.successMessage}>사용 가능한 닉네임입니다.</Text>}
              {isNicknameAvailable === false && <Text style={styles.errorMessage}>이미 사용중인 닉네임입니다.</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>전화번호</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color={theme.colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="010-0000-0000"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={13}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>사용 언어</Text>
              <View style={styles.languageContainer}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.value}
                    style={[
                      styles.languageChip,
                      language === lang.value && styles.languageChipSelected
                    ]}
                    onPress={() => setLanguage(lang.value)}
                  >
                    <Text style={[
                      styles.languageText,
                      language === lang.value && styles.languageTextSelected
                    ]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.completeButton,
              (!nickname || !phoneNumber || isLoading || isNicknameAvailable !== true) && styles.completeButtonDisabled
            ]} 
            onPress={handleComplete}
            disabled={!nickname || !phoneNumber || isLoading || isNicknameAvailable !== true}
          >
            <Text style={styles.completeButtonText}>{isLoading ? '설정 중...' : '시작하기'}</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.gray,
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  languageChipSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10', // 10% opacity
  },
  languageText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  languageTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 28,
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  checkButton: {
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    marginLeft: 8,
  },
  checkButtonDisabled: {
    backgroundColor: theme.colors.gray,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  successMessage: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
  errorMessage: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
});
