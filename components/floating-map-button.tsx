import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MapPin, List } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

interface FloatingMapButtonProps {
  viewMode: 'list' | 'map' | 'detail';
  onToggle: () => void;
}

export function FloatingMapButton({ viewMode, onToggle }: FloatingMapButtonProps) {
  return (
    <Animated.View 
      entering={FadeInUp}
      exiting={FadeOutDown}
      style={styles.container} 
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.9}
        style={styles.button}
      >
        {viewMode === 'list' ? (
          <>
            <MapPin size={22} color="#fff" />
            <Text style={styles.text}>지도에서 보기</Text>
          </>
        ) : (
          <>
            <List size={22} color="#fff" />
            <Text style={styles.text}>목록으로 보기</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110, // Adjusted for bottom navigation and search bar
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.text, // Dark button for contrast
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.2,
  },
});
