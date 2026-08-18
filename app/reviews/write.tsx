import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Star, Camera, X, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { reviewService } from '@/services/review';
import { useShop } from '@/context/ShopContext';
import { theme } from '@/constants/theme';

const RATING_LABELS: Record<number, string> = {
  1: '많이 아쉬워요 😢',
  2: '조금 아쉬워요 🥲',
  3: '보통이에요 🙂',
  4: '정말 만족스러워요! ✨',
  5: '인생 최고의 케이크였어요! 💖',
};

export default function ReviewWriteScreen() {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId: string;
    storeName?: string;
    cakeName?: string;
    cakeImage?: string;
  }>();

  const { refreshReviews } = useShop();

  const orderId = Number(params.orderId);
  const storeName = params.storeName || '주문제작 케이크 샵';
  const cakeName = params.cakeName || '커스텀 케이크';
  const cakeImage = params.cakeImage;

  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '사진을 등록하려면 갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('오류', '이미지를 선택하는 중 문제가 발생했습니다.');
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handleSubmit = async () => {
    if (!orderId || isNaN(orderId)) {
      Alert.alert('오류', '주문 정보가 올바르지 않습니다.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    if (content.trim().length < 5) {
      Alert.alert('알림', '리뷰를 최소 5자 이상 작성해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrl: string | null = null;
      if (imageUri) {
        uploadedImageUrl = await reviewService.uploadImage(imageUri);
      }

      await reviewService.createReview(orderId, {
        rating,
        content: content.trim(),
        imageUrl: uploadedImageUrl,
      });

      // Context 내 리뷰 캐시 최신화
      if (refreshReviews) {
        await refreshReviews();
      }

      Alert.alert(
        '리뷰 작성 완료 🎉',
        '소중한 후기가 성공적으로 등록되었습니다!',
        [
          {
            text: '확인',
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/reviews');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      const errorMessage = error?.message || '';
      if (errorMessage.includes('이미 이 주문에 대한 리뷰가 존재합니다')) {
        Alert.alert('알림', '이미 작성된 리뷰가 있는 주문입니다.');
      } else {
        Alert.alert('오류', '리뷰 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: statusBarHeight + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 작성</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 100 }
        ]} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.summaryCard}>
          {cakeImage && (
            <Image source={{ uri: cakeImage }} style={styles.cakeThumb} contentFit="cover" />
          )}
          <View style={styles.summaryInfo}>
            <Text style={styles.storeNameText}>{storeName}</Text>
            <Text style={styles.cakeNameText} numberOfLines={1}>{cakeName}</Text>
          </View>
        </Animated.View>

        {/* Rating Section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.card}>
          <Text style={styles.sectionTitle}>케이크는 만족스러우셨나요?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starTouch}
                activeOpacity={0.7}
              >
                <Star
                  size={36}
                  color={star <= rating ? '#F59E0B' : '#E5E7EB'}
                  fill={star <= rating ? '#F59E0B' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
        </Animated.View>

        {/* Photo Upload Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.card}>
          <Text style={styles.sectionTitle}>사진 첨부 (선택)</Text>
          <Text style={styles.sectionSubtitle}>
            완성된 케이크의 예쁜 실물 사진을 공유해 주세요!
          </Text>

          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={handleRemoveImage}
                activeOpacity={0.8}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <Camera size={28} color="#FF69B4" />
              <Text style={styles.uploadButtonText}>사진 추가하기</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Content Input Section */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.card}>
          <Text style={styles.sectionTitle}>상세 후기 작성</Text>
          <TextInput
            style={styles.textArea}
            placeholder="케이크의 디자인, 맛, 포장, 픽업 경험 등 솔직한 후기를 남겨주시면 다른 구매자들과 사장님께 큰 도움이 돼요!"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            value={content}
            onChangeText={setContent}
            maxLength={500}
            textAlignVertical="top"
          />
          <View style={styles.charCountRow}>
            <Text style={styles.charCountText}>{content.length} / 500자</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Submit Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!content.trim() || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.submitButtonContent}>
              <CheckCircle2 size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>리뷰 등록하기</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  cakeThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  storeNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EC4899',
    marginBottom: 2,
  },
  cakeNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  starTouch: {
    padding: 4,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    marginTop: 4,
  },
  uploadButton: {
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FCE7F3',
    borderStyle: 'dashed',
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EC4899',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
  },
  textArea: {
    marginTop: 10,
    height: 130,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  charCountText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButton: {
    backgroundColor: '#EC4899',
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#F9A8D4',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
