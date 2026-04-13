import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Home, Search, ShoppingBag, User } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is active
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore" // Search 역할
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      {/* 나중에 실제 파일(orders.tsx 등)을 생성하면 여기에 추가 가능합니다. */}
    </Tabs>
  );
}
