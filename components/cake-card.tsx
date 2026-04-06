import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Heart, Star } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2; // 2 columns with gutter

interface CakeCardProps {
  id: number;
  image: string;
  shopName: string;
  likes: number;
  rating: number;
  tag?: string;
  onSelect?: (image: string, shopName: string) => void;
  onInquiry?: (image: string, shopName: string) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (
    cakeId: number,
    image: string,
    shopName: string,
    tag?: string
  ) => void;
}

export function CakeCard({
  id,
  image,
  shopName,
  likes,
  rating,
  tag,
  onSelect,
  onInquiry,
  isFavorited,
  onToggleFavorite,
}: CakeCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    setShowActions(false);
    onSelect?.(image, shopName);
  };

  const handleInquiry = () => {
    setShowActions(false);
    onInquiry?.(image, shopName);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite?.(id, image, shopName, tag);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setShowActions(!showActions)}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />

          {/* Tag */}
          {tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          )}

          {/* Bottom Info Gradient Simulation */}
          <View style={styles.infoOverlay}>
            <Text style={styles.shopName} numberOfLines={1}>
              {shopName}
            </Text>
            <View style={styles.statsContainer}>
              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={styles.statItem}
              >
                <Heart
                  size={14}
                  color={isFavorited ? '#EF4444' : '#fff'}
                  fill={isFavorited ? '#EF4444' : 'transparent'}
                />
                <Text style={styles.statText}>{likes}</Text>
              </TouchableOpacity>
              <View style={styles.statItem}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.statText}>{rating}</Text>
              </View>
            </View>
          </View>

          {/* Actions Overlay */}
          {showActions && (
            <View style={styles.actionsOverlay}>
              <TouchableOpacity
                onPress={handleEdit}
                style={[styles.actionButton, styles.editButton]}
              >
                <Text style={styles.editButtonText}>편집하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleInquiry}
                style={[styles.actionButton, styles.inquiryButton]}
              >
                <Text style={styles.inquiryButtonText}>문의하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  shopName: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    color: '#fff',
    fontSize: 11,
  },
  actionsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
  },
  actionButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#fff',
  },
  editButtonText: {
    color: '#1F2937',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inquiryButton: {
    backgroundColor: '#FF69B4',
  },
  inquiryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
