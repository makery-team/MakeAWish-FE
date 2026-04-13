import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, Star, Trash2, Edit2, MoreVertical } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import type { Review } from '@/types';

interface ReviewsViewProps {
  reviews: Review[];
  onBack: () => void;
  onDeleteReview: (id: string) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ 
  reviews, 
  onBack, 
  onDeleteReview 
}) => {
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            color={star <= rating ? '#FBBF24' : '#D1D5DB'}
            fill={star <= rating ? '#FBBF24' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Review; index: number }) => (
    <Animated.View 
      entering={FadeInUp.delay(index * 100)}
      style={styles.reviewCard}
    >
      {/* Review Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <Image
            source={{ uri: item.cakeImage }}
            style={styles.headerImage}
            contentFit="cover"
          />
          <View style={styles.headerText}>
            <Text style={styles.shopName} numberOfLines={1}>
              {item.shopName}
            </Text>
            {renderStars(item.rating)}
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setExpandedReview(expandedReview === item.id ? null : item.id)}
            style={styles.moreButton}
          >
            <MoreVertical size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {expandedReview === item.id && (
          <View style={styles.actionMenu}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => {
                onDeleteReview(item.id);
                setExpandedReview(null);
              }}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.actionTextRed}>삭제하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Review Content */}
      <View style={styles.cardContent}>
        {item.orderInfo && (
          <Text style={styles.orderInfo}>
            {item.orderInfo}
          </Text>
        )}
        <Text style={styles.commentText}>
          {item.comment}
        </Text>

        {/* Review Images */}
        {item.images && item.images.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesScroll}
            contentContainerStyle={styles.imagesScrollContent}
          >
            {item.images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={styles.reviewImage}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>나의 리뷰</Text>
          <Text style={styles.headerSub}>{reviews.length}개의 리뷰</Text>
        </View>
      </View>

      {/* Content */}
      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <Star size={48} color="#E5E7EB" />
          </View>
          <Text style={styles.emptyTitle}>작성한 리뷰가 없습니다</Text>
          <Text style={styles.emptySub}>
            주문하신 케이크는 어떠셨나요? 리뷰를 남겨주세요!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
    backgroundColor: '#FFF9FB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerText: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  moreButton: {
    padding: 4,
  },
  actionMenu: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE4E1',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionTextRed: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  orderInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  imagesScroll: {
    marginTop: 12,
  },
  imagesScrollContent: {
    gap: 8,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    backgroundColor: '#F9FAFB',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
