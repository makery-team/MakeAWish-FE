import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MapPin, List } from 'lucide-react-native';

interface FloatingMapButtonProps {
  viewMode: 'list' | 'map' | 'detail';
  onToggle: () => void;
}

export function FloatingMapButton({ viewMode, onToggle }: FloatingMapButtonProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        style={styles.button}
      >
        {viewMode === 'list' ? (
          <>
            <MapPin size={20} color="#374151" />
            <Text style={styles.text}>지도 보기</Text>
          </>
        ) : (
          <>
            <List size={20} color="#374151" />
            <Text style={styles.text}>목록 보기</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100, // Adjusted for bottom navigation
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 40,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFE4E1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 15,
  },
});
