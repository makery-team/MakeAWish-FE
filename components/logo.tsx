import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 36 }: LogoProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <LinearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF7B9C" />
            <Stop offset="100%" stopColor="#FF3366" />
          </LinearGradient>
        </Defs>

        {/* Cake Base: A clean, modern rounded rectangle instead of stacked pills */}
        <Rect x="16" y="55" width="68" height="35" rx="8" fill="url(#brandGrad)" />
        
        {/* Frosting / Highlight Line for detail */}
        <Rect x="16" y="55" width="68" height="12" rx="6" fill="#FFA6C9" opacity="0.9" />

        {/* Candle */}
        <Rect x="46" y="25" width="8" height="32" rx="3" fill="#FFFFFF" />
        <Rect x="46" y="32" width="8" height="4" fill="#FF7B9C" opacity="0.5" />
        <Rect x="46" y="42" width="8" height="4" fill="#FF7B9C" opacity="0.5" />
        
        {/* Flame (Clean teardrop) */}
        <Path 
          d="M 50 6 
             C 55 14, 56 20, 50 20 
             C 44 20, 45 14, 50 6 Z" 
          fill="#FFC107" 
        />

        {/* Magical Sparkle */}
        <Path 
          d="M 80 15 
             Q 82 23 90 25 
             Q 82 27 80 35 
             Q 78 27 70 25 
             Q 78 23 80 15 Z" 
          fill="#FFC107" 
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
