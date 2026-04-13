import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Search, ShoppingBag, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'orders', icon: ShoppingBag, label: 'Orders' },
  { id: 'profile', icon: User, label: 'Profile' },
];

interface BottomNavigationProps {
  activeTab?: string;
  onTabClick?: (tabId: string) => void;
}

export function BottomNavigation({ activeTab = 'home', onTabClick }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.content}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => onTabClick?.(item.id)}
              style={styles.navItem}
            >
              <Icon
                size={24}
                color={isActive ? '#FF69B4' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? '#FF69B4' : '#9CA3AF', fontWeight: isActive ? '500' : '400' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
  },
  label: {
    fontSize: 12,
  },
});
