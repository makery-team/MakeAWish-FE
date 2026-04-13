import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { theme } from '@/constants/theme';
import Animated, { Layout } from 'react-native-reanimated';

const tags = [
  { id: 1, label: '#ForYou(AI추천)', category: 'all' },
  { id: 2, label: '#Y2K감성', category: 'y2k' },
  { id: 3, label: '#동물모양', category: 'animal' },
  { id: 4, label: '#심플/미니멀', category: 'minimal' },
  { id: 6, label: '#화려한', category: 'colorful' },
];

interface RecommendationTagsProps {
  onTagSelect?: (category: string) => void;
}

export function RecommendationTags({ onTagSelect }: RecommendationTagsProps) {
  const [selectedTag, setSelectedTag] = useState(1);

  const handleTagClick = (tagId: number, category: string) => {
    setSelectedTag(tagId);
    if (onTagSelect) {
      onTagSelect(category);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            onPress={() => handleTagClick(tag.id, tag.category)}
            activeOpacity={0.7}
            style={[
              styles.tag,
              selectedTag === tag.id ? styles.selectedTag : styles.unselectedTag,
            ]}
          >
            <Text
              style={[
                styles.tagText,
                selectedTag === tag.id ? styles.selectedTagText : styles.unselectedTagText,
              ]}
            >
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  tag: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  selectedTag: {
    backgroundColor: '#FFF0F5',
    borderColor: theme.colors.primary,
  },
  unselectedTag: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedTagText: {
    color: theme.colors.primary,
  },
  unselectedTagText: {
    color: theme.colors.gray,
  },
});
