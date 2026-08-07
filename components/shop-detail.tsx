import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Star, MapPin, Clock, Phone, Share2, MessageCircle, Heart } from 'lucide-react-native';
import { SAMPLE_CAKE_IMAGES } from '@/constants/mock-data';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { mapService } from '@/services/map';
import { Store, StorePortfolio, StoreReview } from '@/types';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';
import { chatService } from '@/services/chat';

// Mock 데이터 상수들 삭제됨

// 상세 정보 오버라이드 (일부 샵만 별도 정보 설정)
const SHOP_DETAIL_OVERRIDES: Record<number, {
  phone: string;
  hours: string;
  description: string;
  likes: number;
  gallery: string[];
}> = {
  1: {
    phone: '02-1234-5678',
    hours: '매일 10:00 - 20:00 (월요일 휴무)',
    description: '심플한 Y2K 감성부터 화려한 캐릭터 케이크까지! 원하는 디자인을 말씀해주세요. AI 이미지 편집기로 나만의 케이크를 미리 만들어보고 주문할 수 있습니다.',
    likes: 342,
    gallery: SAMPLE_CAKE_IMAGES,
  },
  2: {
    phone: '02-2345-6789',
    hours: '월-토 09:00 - 21:00',
    description: '특별한 날을 더 특별하게! 정성 가득한 레터링 케이크 전문점입니다. 천연 색소와 동물성 생크림만을 사용하여 맛과 건강을 모두 생각합니다.',
    likes: 521,
    gallery: [...SAMPLE_CAKE_IMAGES].reverse(),
  },
};

// [Option A 규격화] 요일별 운영시간 JSON 문자열 또는 일반 텍스트를 파싱하여 렌더링하는 헬퍼 함수
function renderOperatingHours(hoursStr: string) {
  if (!hoursStr) return <Text style={styles.contactText}>영업시간 문의</Text>;

  try {
    if (hoursStr.trim().startsWith('{') && hoursStr.trim().endsWith('}')) {
      const parsed = JSON.parse(hoursStr);
      const dayMap: Record<string, string> = {
        mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
        '월': '월', '화': '화', '수': '수', '목': '목', '금': '금', '토': '토', '일': '일',
      };
      const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      return (
        <View style={styles.hoursTableContainer}>
          {days.map((key) => {
            const timeVal = parsed[key] || parsed[dayMap[key]];
            if (!timeVal) return null;
            const isClosed = timeVal.includes('휴무') || timeVal.includes('Closed');
            return (
              <View key={key} style={styles.hoursTableRow}>
                <Text style={[styles.hoursDayText, isClosed && styles.hoursClosedText]}>{dayMap[key]}</Text>
                <Text style={[styles.hoursTimeText, isClosed && styles.hoursClosedText]}>{timeVal}</Text>
              </View>
            );
          })}
        </View>
      );
    }
  } catch (e) {
    // JSON 파싱 실패 시 일반 문자열로 표시
  }

  if (hoursStr.includes('\n')) {
    return (
      <View style={styles.hoursTableContainer}>
        {hoursStr.split('\n').map((line, idx) => (
          <Text key={idx} style={styles.contactText}>{line}</Text>
        ))}
      </View>
    );
  }

  return <Text style={styles.contactText}>{hoursStr}</Text>;
}

interface ShopDetailProps {
  shopId: number;
  onBack: () => void;
  onCakeSelect?: (image: string, shopName: string) => void;
  onCakeInquiry?: (image: string, shopName: string) => void;
}

export function ShopDetail({ shopId, onBack, onCakeSelect, onCakeInquiry }: ShopDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorited, toggleFavorite, likeCounts } = useShop();
  const [localLikes, setLocalLikes] = useState<Record<number, number>>({});
  // API 상태
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [portfolios, setPortfolios] = useState<StorePortfolio[]>([]);
  const [reviewList, setReviewList] = useState<StoreReview[]>([]);
  const [activeChip, setActiveChip] = useState('전체');
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);

  useEffect(() => {
    setIsLoadingDetail(true);
    Promise.allSettled([
      mapService.getStoreDetail(shopId),
      mapService.getStorePortfolios(shopId, 0, 20),
      mapService.getStoreReviews(shopId, 0, 5),
    ]).then(([detailResult, portfoliosResult, reviewsResult]) => {
      if (detailResult.status === 'fulfilled') {
        const data = detailResult.value;
        setStoreData(data);
        if (data.categories && data.categories.length > 0) {
          setActiveChip(data.categories[0].name);
        }
      }
      if (portfoliosResult.status === 'fulfilled') setPortfolios(portfoliosResult.value.content);
      if (reviewsResult.status === 'fulfilled') setReviewList(reviewsResult.value.content);
    }).finally(() => setIsLoadingDetail(false));
  }, [shopId]);

  if (isLoadingDetail) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!storeData) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <Text>매장 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  // 갤러리 이미지 추출 (카테고리의 포트폴리오를 모두 병합)
  const apiGallery = storeData.categories
    ? storeData.categories.flatMap(c => c.portfolios || []).map(p => p.imageUrl)
    : [];

  // 샵의 총 좋아요 수 (각 포트폴리오의 likeCount 합산)
  const totalLikes = storeData.categories
    ? storeData.categories.flatMap(c => c.portfolios || []).reduce((sum, p) => sum + (p.likeCount || 0), 0)
    : 0;

  // TODO(BACKEND): 매장 평점(rating)과 리뷰 수(reviewCount)가 현재 DB stores 테이블의 초기 고정값으로 전달됨.
  // 추후 백엔드에서 리뷰 작성/수정/삭제 시 실시간 집계(AVG/COUNT) 로직이 구현되면 동적 반영 테스트 필요!
  const shop = {
    id: storeData.id,
    name: storeData.name || '이름 없음',
    rating: storeData.rating || 0,
    reviews: storeData.reviewCount || 0,
    likes: totalLikes || (SHOP_DETAIL_OVERRIDES[Number(shopId)]?.likes ?? 0),
    specialty: storeData.categories && storeData.categories.length > 0 ? storeData.categories[0].name : '커스텀 케이크',
    address: storeData.address || '주소 정보 없음',
    phone: storeData.phone || '전화번호 정보 없음',
    hours: storeData.hours || '영업시간 문의',
    description: storeData.description || '매장 소개가 없습니다.',
    gallery: apiGallery.length > 0 ? apiGallery : (SHOP_DETAIL_OVERRIDES[Number(shopId)]?.gallery || [SAMPLE_CAKE_IMAGES[0]]),
  };

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
    // API 포트폴리오가 있으면 우선 사용, 없으면 기존 mock 데이터
    const selectedCategory = storeData.categories?.find(c => c.name === activeChip);
    const validCatPortfolios = selectedCategory?.portfolios && selectedCategory.portfolios.some(p => (p.id && p.id > 0) || (p.portfolioId && p.portfolioId > 0))
      ? selectedCategory.portfolios
      : [];
    const categoryPortfolios = portfolios && portfolios.length > 0
      ? portfolios
      : validCatPortfolios.length > 0
      ? validCatPortfolios
      : [];

    const items = categoryPortfolios.length > 0
      ? categoryPortfolios.map((p, idx) => {
          const cakeId = p.id || p.portfolioId || (Number(shopId) * 1000 + idx);
          const isFav = isFavorited(cakeId);
          const baseLikes = p.likeCount || (38 + (idx * 23) % 120);
          const globalLikes = likeCounts[cakeId.toString()];
          const currentLikes = globalLikes !== undefined
            ? globalLikes
            : (localLikes[cakeId] !== undefined ? localLikes[cakeId] : baseLikes);
          return {
            id: cakeId,
            imageUrl: p.imageUrl,
            likes: currentLikes,
            isFav,
          };
        })
      : shop.gallery.map((img, idx) => {
          const cakeId = Number(shopId) * 1000 + idx;
          const isFav = isFavorited(cakeId);
          const baseLikes = 38 + (idx * 23) % 120;
          const globalLikes = likeCounts[cakeId.toString()];
          const currentLikes = globalLikes !== undefined
            ? globalLikes
            : (localLikes[cakeId] !== undefined ? localLikes[cakeId] : baseLikes);
          return {
            id: cakeId,
            imageUrl: img,
            likes: currentLikes,
            isFav,
          };
        });

    const leftCol: { id: number; imageUrl: string; likes: number; isFav: boolean }[] = [];
    const rightCol: { id: number; imageUrl: string; likes: number; isFav: boolean }[] = [];
    items.forEach((item, i) => {
      if (i % 2 === 0) leftCol.push(item);
      else rightCol.push(item);
    });

    const renderItem = (item: { id: number; imageUrl: string; likes: number; isFav: boolean }, idx: number, side: 'left' | 'right') => (
      <View key={`${side}-${idx}`} style={styles.galleryItemWrapper}>
        <Image
          source={{ uri: item.imageUrl }}
          style={[
            styles.galleryImage,
            { aspectRatio: side === 'left' ? (idx % 2 === 0 ? 0.85 : 1.15) : (idx % 2 === 0 ? 1.15 : 0.85) },
          ]}
        />
        {/* 개별 포트폴리오 좋아요 배지 (클릭 가능 & 찜하기 실시간 동기화) */}
        <TouchableOpacity
          style={styles.galleryLikeBadge}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => {
            toggleFavorite(item.id, item.imageUrl, shop.name, undefined, item.likes);
          }}
        >
          <Heart 
            size={12} 
            color={item.isFav ? "#EF4444" : "white"} 
            fill={item.isFav ? "#EF4444" : "transparent"} 
          />
          <Text style={[styles.galleryLikeText, item.isFav && { color: '#EF4444' }]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        {/* 오버레이: 이미지 하단 그라데이션 + 버튼 2개 */}
        <View style={styles.imageOverlay}>
          <TouchableOpacity
            style={styles.imageActionOutline}
            onPress={() => onCakeSelect?.(item.imageUrl, shop.name)}
            activeOpacity={0.85}
          >
            <Text style={styles.imageActionOutlineText}>이 시안 수정해보기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageActionFill}
            onPress={() => onCakeInquiry?.(item.imageUrl, shop.name)}
            activeOpacity={0.85}
          >
            <Text style={styles.imageActionFillText}>이 시안 그대로 주문하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    return (
      <View style={styles.galleryGrid}>
        <View style={styles.galleryColumn}>
          {leftCol.map((item, i) => renderItem(item, i, 'left'))}
        </View>
        <View style={styles.galleryColumn}>
          {rightCol.map((item, i) => renderItem(item, i, 'right'))}
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
              {renderOperatingHours(shop.hours)}
            </View>
            <View style={styles.contactItem}>
              <Phone size={18} color="#999" />
              <Text style={styles.contactText}>{shop.phone}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            onPress={async () => {
              if (!user) {
                import('react-native').then(rn => {
                  rn.Alert.alert('로그인 필요', '채팅을 시작하려면 로그인이 필요합니다.');
                });
                return;
              }
              try {
                // 백엔드에 채팅방 생성 요청
                const room = await chatService.createChatRoom(shopId);
                // 생성된 채팅방으로 이동
                router.push(`/chat/${room.roomNumber}?storeName=${encodeURIComponent(shop.name)}&myUserId=${user.id}` as any);
              } catch (error) {
                console.error('Failed to create chat room:', error);
                import('react-native').then(rn => {
                  rn.Alert.alert('오류', '채팅방을 생성하지 못했습니다.');
                });
              }
            }}
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
            {(() => {
              const chips = storeData.categories && storeData.categories.length > 0 
                ? storeData.categories.map(c => c.name) 
                : ['전체'];
              return chips.map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chip, activeChip === chip && styles.chipActive]}
                  onPress={() => setActiveChip(chip)}
                >
                  <Text style={[styles.chipText, activeChip === chip && styles.chipTextActive]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              ));
            })()}
          </ScrollView>
        </View>

        {/* Gallery */}
        <View style={styles.gallerySection}>
          <Text style={styles.sectionTitle}>{activeChip}</Text>
          {isLoadingDetail ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : (
            renderGallery()
          )}
        </View>

        {/* Reviews */}
        {reviewList.length > 0 && (
          <View style={reviewStyles.section}>
            <Text style={styles.sectionTitle}>리뷰 ({shop.reviews})</Text>
            {reviewList.map((review) => (
              <View key={review.id} style={reviewStyles.card}>
                <View style={reviewStyles.header}>
                  <Text style={reviewStyles.nickname}>{review.nickname}</Text>
                  <View style={reviewStyles.stars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        color="#FACC15"
                        fill={i < review.rating ? '#FACC15' : 'none'}
                      />
                    ))}
                  </View>
                  <Text style={reviewStyles.date}>{review.createdAt.slice(0, 10)}</Text>
                </View>
                <Text style={reviewStyles.content}>{review.content}</Text>
                {review.imageUrl && review.imageUrl.startsWith('http') && !review.imageUrl.includes('localhost') && !review.imageUrl.includes('review.img') && (
                  <View style={reviewStyles.imageRow}>
                    <Image
                      source={{ uri: review.imageUrl }}
                      style={reviewStyles.reviewImage}
                      contentFit="cover"
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  shopInfo: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: 'rgba(0,0,0,0.03)',
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
  hoursTableContainer: {
    flex: 1,
    backgroundColor: '#FFF5F8',
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  hoursTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  hoursTimeText: {
    fontSize: 13,
    color: '#333',
  },
  hoursClosedText: {
    color: '#FF4D4F',
    fontWeight: '700',
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
  galleryItemWrapper: {
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  galleryLikeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  galleryLikeText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.38)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 5,
  },
  imageActionOutline: {
    borderWidth: 1.5,
    borderColor: 'white',
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  imageActionOutlineText: {
    fontSize: 10,
    color: 'white',
  },
  imageActionFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  imageActionFillText: {
    fontSize: 10,
    color: 'white',
  },
  tagsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tagsTitle: {
    fontSize: 14,
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
    color: 'white',
  },
  chipBarWrapper: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
    color: '#444',
  },
  chipTextActive: {
    color: 'white',
  },
});

const reviewStyles = StyleSheet.create({
  section: {
    padding: 20,
    borderTopWidth: 8,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nickname: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    fontSize: 11,
    color: '#AAA',
  },
  content: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  imageRow: {
    marginTop: 10,
  },
  reviewImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
});
