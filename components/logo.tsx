import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '@/constants/theme';

interface LogoProps {
  color?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ color = theme.colors.primary, size = 26, showText = true }: LogoProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="cakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF7B9C" />
            <Stop offset="100%" stopColor="#FF3366" />
          </LinearGradient>
          <LinearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFD166" />
            <Stop offset="100%" stopColor="#FF9F1C" />
          </LinearGradient>
        </Defs>
        
        {/* Cake Layers */}
        <Path d="M 15 75 Q 50 90 85 75 L 85 85 Q 50 100 15 85 Z" fill="url(#cakeGrad)" opacity="0.2" />
        <Path d="M 15 60 Q 50 75 85 60 L 85 75 Q 50 90 15 75 Z" fill="url(#cakeGrad)" opacity="0.6" />
        <Path d="M 15 45 Q 50 60 85 45 L 85 60 Q 50 75 15 60 Z" fill="url(#cakeGrad)" />
        <Path d="M 15 45 Q 50 30 85 45 Q 50 60 15 45 Z" fill="#FFB3C6" />
        
        {/* Frosting details */}
        <Path d="M 15 45 Q 22 55 29 45 Q 36 60 43 45 Q 50 55 57 45 Q 64 60 71 45 Q 78 55 85 45" fill="none" stroke="#FFB3C6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Candle */}
        <Path d="M 45 15 L 55 15 L 55 40 L 45 40 Z" fill="#FFFFFF" stroke="url(#cakeGrad)" strokeWidth="3" strokeLinejoin="round" />
        <Path d="M 45 20 L 55 25 M 45 30 L 55 35" stroke="url(#cakeGrad)" strokeWidth="3" />
        
        {/* Flame */}
        <Path d="M 50 0 Q 58 8 50 12 Q 42 8 50 0 Z" fill="url(#flameGrad)" />
        
        {/* Sparkles */}
        <Path d="M 75 15 L 78 22 L 85 23 L 78 25 L 75 32 L 72 25 L 65 23 L 72 22 Z" fill="#FFD166" />
        <Path d="M 25 20 L 27 24 L 31 25 L 27 26 L 25 30 L 23 26 L 19 25 L 23 24 Z" fill="#FF7B9C" opacity="0.8" />
      </Svg>
      {showText && (
        <Text style={[styles.text, { color }]}>
          Make a Wish
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
});
