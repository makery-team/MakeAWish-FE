import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 36 }: LogoProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.emoji, { fontSize: size - 8 }]}>🍰</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
