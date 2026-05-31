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
    primary: '#FF7B9C', // Soft Coral Pink
    secondary: '#A3D2CA', // Soft mint
    background: '#FAFAFA', // Warm off-white
    surface: '#FFFFFF', // Pure white for cards
    text: '#212529', // Dark grey for typography
    textMuted: '#868E96', // Light grey text
    border: '#F1F3F5', // Very light border
    gray: '#868E96',
    lightGray: '#F8F9FA', // Very light background
  },
};
