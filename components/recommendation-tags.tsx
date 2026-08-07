import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { theme } from '@/constants/theme';
import Animated, { Layout } from 'react-native-reanimated';
import { tagService } from '@/services/tag';

const DEFAULT_TAGS = [
  { id: 1, label: '#전체', category: 'all' },
  { id: 2, label: '#생일', category: '생일' },
  { id: 3, label: '#기념일', category: '기념일' },
  { id: 4, label: '#리본', category: '리본' },
  { id: 5, label: '#캐릭터', category: '캐릭터' },
];

interface RecommendationTagsProps {
  onTagSelect?: (category: string) => void;
}

export function RecommendationTags({ onTagSelect }: RecommendationTagsProps) {
  const [selectedTag, setSelectedTag] = useState(1);
  const [tags, setTags] = useState(DEFAULT_TAGS);

  useEffect(() => {
    const loadTrendingTags = async () => {
      try {
        const trendingTagNames = await tagService.getTrendingTags(6);
        if (trendingTagNames && trendingTagNames.length > 0) {
          const dynamicTags = [
            { id: 1, label: '#전체', category: 'all' },
            ...trendingTagNames.map((name, index) => ({
              id: index + 2,
              label: `#${name}`,
              category: name
            }))
          ];
          setTags(dynamicTags);
        }
      } catch (error) {
        console.error('Failed to load trending tags, using defaults', error);
      }
    };
    loadTrendingTags();
  }, []);

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
    },
  selectedTagText: {
    color: theme.colors.primary,
  },
  unselectedTagText: {
    color: theme.colors.gray,
  },
});
