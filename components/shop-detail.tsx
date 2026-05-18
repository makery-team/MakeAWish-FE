import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Star, MapPin, Clock, Phone, Share2, MessageCircle } from 'lucide-react-native';
import { SAMPLE_CAKE_IMAGES } from '@/constants/mock-data';
import { theme } from '@/constants/theme';

const CHIPS = ['검색한 메뉴', '인기 메뉴', '레터링 케이크', '도시락 케이크', '당일 픽업 가능', '3단 케이크'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const shopData = {
  1: {
    id: 1,
    name: 'Creamy Seoul',
    rating: 4.9,
    likes: 342,
    reviews: 156,
    specialty: 'Y2K 감성 케이크',
    address: '서울 강남구 역삼로 123',
    phone: '02-1234-5678',
    hours: '매일 10:00 - 20:00 (월요일 휴무)',
    description: '심플한 Y2K 감성부터 화려한 캐릭터 케이크까지! 원하는 디자인을 말씀해주세요. AI 이미지 편집기로 나만의 케이크를 미리 만들어보고 주문할 수 있습니다.',
    gallery: [
      SAMPLE_CAKE_IMAGES[0],
      SAMPLE_CAKE_IMAGES[1],
      SAMPLE_CAKE_IMAGES[2],
      SAMPLE_CAKE_IMAGES[3],
      SAMPLE_CAKE_IMAGES[4],
      SAMPLE_CAKE_IMAGES[5],
    ],
  },
  2: {
    id: 2,
    name: 'BlueDream Cakes',
    rating: 5.0,
    likes: 521,
    reviews: 234,
    specialty: '레터링 케이크',
    address: '서울 성동구 성수이로 456',
    phone: '02-2345-6789',
    hours: '월-토 09:00 - 21:00',
    description: '특별한 날을 더 특별하게! 정성 가득한 레터링 케이크 전문점입니다. 천연 색소와 동물성 생크림만을 사용하여 맛과 건강을 모두 생각합니다.',
    gallery: [
      SAMPLE_CAKE_IMAGES[1],
      SAMPLE_CAKE_IMAGES[2],
      SAMPLE_CAKE_IMAGES[3],
      SAMPLE_CAKE_IMAGES[4],
      SAMPLE_CAKE_IMAGES[0],
      SAMPLE_CAKE_IMAGES[5],
    ],
  },
};

interface ShopDetailProps {
  shopId: number;
  onBack: () => void;
  onCakeSelect?: (image: string, shopName: string) => void;
  onCakeInquiry?: (image: string, shopName: string) => void;
}

export function ShopDetail({ shopId, onBack, onCakeSelect, onCakeInquiry }: ShopDetailProps) {
  const [activeChip, setActiveChip] = useState('검색한 메뉴');
  const shop = (shopData as any)[shopId] || shopData[1];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${shop.name} - ${shop.specialty}\n${shop.address}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderGallery = () => {
    const leftCol: string[] = [];
    const rightCol: string[] = [];

    shop.gallery.forEach((img: string, i: number) => {
      if (i % 2 === 0) leftCol.push(img);
      else rightCol.push(img);
    });

    return (
      <View style={styles.galleryGrid}>
        <View style={styles.galleryColumn}>
          {leftCol.map((img, i) => (
            <TouchableOpacity
              key={`left-${i}`}
              onPress={() => onCakeSelect?.(img, shop.name)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: img }} style={[styles.galleryImage, { aspectRatio: i % 2 === 0 ? 0.8 : 1.2 }]} />
              <View style={styles.imageOverlay}>
                <TouchableOpacity
                  style={styles.imageAction}
                  onPress={() => onCakeInquiry?.(img, shop.name)}
                >
                  <Text style={styles.imageActionText}>상담하기</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.galleryColumn}>
          {rightCol.map((img, i) => (
            <TouchableOpacity
              key={`right-${i}`}
              onPress={() => onCakeSelect?.(img, shop.name)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: img }} style={[styles.galleryImage, { aspectRatio: i % 2 === 0 ? 1.2 : 0.8 }]} />
              <View style={styles.imageOverlay}>
                <TouchableOpacity
                  style={styles.imageAction}
                  onPress={() => onCakeInquiry?.(img, shop.name)}
                >
                  <Text style={styles.imageActionText}>상담하기</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{shop.name}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <Share2 size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} stickyHeaderIndices={[1]}>
        {/* Shop Profile */}
        <View style={styles.shopInfo}>
          <View style={styles.shopHeader}>
            <Image source={{ uri: shop.gallery[0] }} style={styles.shopLogo} />
            <View style={styles.shopHeaderRight}>
              <Text style={styles.shopName}>@{shop.name}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Star size={18} color="#FACC15" fill="#FACC15" />
                  <Text style={styles.statText}>{shop.rating}</Text>
                  <Text style={styles.statCount}>({shop.reviews})</Text>
                </View>
                <View style={styles.stat}>
                  <Heart size={18} color={theme.colors.primary} fill={theme.colors.primary} />
                  <Text style={styles.statText}>{shop.likes}</Text>
                </View>
              </View>
              <View style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{shop.specialty}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.description}>{shop.description}</Text>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <MapPin size={18} color="#999" />
              <Text style={styles.contactText}>{shop.address}</Text>
            </View>
            <View style={styles.contactItem}>
              <Clock size={18} color="#999" />
              <Text style={styles.contactText}>{shop.hours}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={18} color="#999" />
              <Text style={styles.contactText}>{shop.phone}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => onCakeInquiry?.(shop.gallery[0], shop.name)}
          >
            <MessageCircle size={18} color="white" />
            <Text style={styles.chatButtonText}>1:1로 사장님께 채팅 문의하기</Text>
          </TouchableOpacity>
        </View>

        {/* Chip Bar - sticky */}
        <View style={styles.chipBarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipBar}
          >
            {CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, activeChip === chip && styles.chipActive]}
                onPress={() => setActiveChip(chip)}
              >
                <Text style={[styles.chipText, activeChip === chip && styles.chipTextActive]}>
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Gallery */}
        <View style={styles.gallerySection}>
          <Text style={styles.sectionTitle}>{activeChip}</Text>
          {renderGallery()}
        </View>
      </ScrollView>

      {/* AI Assistant Bar */}
      <View style={styles.aiBar}>
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>지니</Text>
        </View>
        <View>
          <Text style={styles.aiName}>지니 AI 어시스턴트</Text>
          <Text style={styles.aiDesc}>원하는 케이크를 찾아드려요</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  shopInfo: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: '#F8F8F8',
  },
  shopHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  shopLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  shopHeaderRight: {
    flex: 1,
    justifyContent: 'center',
  },
  shopName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  statCount: {
    fontSize: 13,
    color: '#999',
  },
  specialtyTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#444',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: '#FFF0F5',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  gallerySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  galleryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  galleryColumn: {
    flex: 1,
    gap: 12,
  },
  galleryImage: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  imageAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  imageActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  tagsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#777',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: 16,
    marginTop: 24,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  chipBarWrapper: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chipBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  chipActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
  },
  chipTextActive: {
    color: 'white',
  },
  aiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  aiName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  aiDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
});
