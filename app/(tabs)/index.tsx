import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AISearchBar } from "@/components/ai-search-bar";
import { CakeGrid } from "@/components/cake-grid";
import { Header } from "@/components/header";
import { MapView } from "@/components/map-view";
import { RecommendationTags } from "@/components/recommendation-tags";

import { useFavorites } from "@/hooks/use-favorites";
import { useFilter } from "@/hooks/use-filter";
import { useInquiry } from "@/hooks/use-inquiry";
import { useNavigation } from "@/hooks/use-navigation";
import { useOrders } from "@/hooks/use-orders";

import type { OrderData } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { addOrder } = useOrders();
  const { favorites, toggleFavorite } = useFavorites();
  const { inquiryMode, startInquiry, completeInquiry } = useInquiry();
  const { selectedCategory, handleTagSelect } = useFilter();

  const insets = useSafeAreaInsets();
  const tabBarHeightFromNavigator = useBottomTabBarHeight();
  const tabBarHeight =
    tabBarHeightFromNavigator > 0
      ? tabBarHeightFromNavigator
      : insets.bottom + 60;

  // COLLAPSED_BAR_HEIGHT from AISearchBar is 60.
  // We add some buffer for the collapsed sheet above the tab bar.
  const dynamicPaddingBottom = tabBarHeight + 60 + 20;

  // Handler for cake inquiry from grid
  const handleCakeInquiry = (image: string, shopName: string) => {
    startInquiry({
      image,
      shopName,
      design: "디자인 상세 선택",
    });
  };

  // Handler for completing inquiry
  const handleInquiryComplete = (orderData?: OrderData) => {
    completeInquiry();

    if (orderData) {
      addOrder(orderData);
      router.push("/orders");
    }
  };

  const handleNavigateToOrders = () => router.push("/orders");
  const handleNavigateToFavorites = () => router.push("/favorites");
  const handleNavigateToReviews = () => router.push("/reviews");

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <Header
        onNavigateToOrders={handleNavigateToOrders}
        onNavigateToFavorites={handleNavigateToFavorites}
        onNavigateToReviews={handleNavigateToReviews}
        viewMode={navigation.viewMode}
        onToggleView={navigation.handleToggleView}
      />

      {/* Content Area */}
      <View style={styles.content}>
        {/* AI Recommendation Tags */}
        {navigation.viewMode === "list" && (
          <View style={styles.tagsContainer}>
            <RecommendationTags onTagSelect={handleTagSelect} />
          </View>
        )}

        {/* Main Content Views - Only List and Map remain here */}
        {navigation.viewMode === "list" && (
          <View style={styles.viewContainer}>
            <CakeGrid
              onCakeSelect={(image, shopName) => {
                router.push({
                  pathname: "/editor/[id]",
                  params: { id: "grid", image, shopName },
                });
              }}
              onCakeInquiry={handleCakeInquiry}
              selectedCategory={selectedCategory}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              contentContainerStyle={{ paddingBottom: dynamicPaddingBottom }}
            />
          </View>
        )}

        {navigation.viewMode === "map" && (
          <View
            style={[
              styles.mapContainer,
              { paddingBottom: dynamicPaddingBottom },
            ]}
          >
            <MapView
              onShopSelect={(shopId) => {
                router.push(`/shop/${shopId}`);
              }}
            />
          </View>
        )}
      </View>

      {/* AI Search Bar - Bottom Sheet */}
      <AISearchBar
        onCakeSelect={(image: string, shopName: string) => {
          router.push({
            pathname: "/editor/[id]",
            params: { id: "ai", image, shopName },
          });
        }}
        inquiryMode={inquiryMode || undefined}
        onInquiryComplete={handleInquiryComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
  tagsContainer: {
    marginTop: 16,
  },
  viewContainer: {
    flex: 1,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
    marginTop: 16,
  },
});
