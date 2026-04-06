import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

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
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedTag: {
    backgroundColor: '#FFE4E1',
    borderColor: '#FFE4E1',
  },
  unselectedTag: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTagText: {
    color: '#FF69B4',
  },
  unselectedTagText: {
    color: '#4B5563',
  },
});
