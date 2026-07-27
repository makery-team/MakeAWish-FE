/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const theme = {
  colors: {
    primary: '#ff6aa3', // cake-pink-500
    secondary: '#7fd8ac', // cake-mint-400
    background: '#fffaf3', // cake-cream
    surface: '#FFFFFF', // Pure white for cards
    text: '#4a3b3f', // cake-ink
    textMuted: '#8a7a7e', // cake-ink-soft
    border: '#ffd0e0', // cake-pink-200
    gray: '#8a7a7e',
    lightGray: '#ffe6ee', // cake-pink-100
    error: '#f14a89', // cake-pink-600
  },
};
