import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AISearchBar, COLLAPSED_BAR_HEIGHT } from "@/components/ai-search-bar";
import { CakeGrid } from "@/components/cake-grid";
import { Header } from "@/components/header";
import { MapView } from "@/components/map-view";
import { RecommendationTags } from "@/components/recommendation-tags";

import { useFavorites } from "@/hooks/use-favorites";
import { useFilter } from "@/hooks/use-filter";
import { useInquiry } from "@/hooks/use-inquiry";
import { useNavigation } from "@/hooks/use-navigation";
import { useOrders } from "@/hooks/use-orders";

import type { OrderData, FeedItem } from "@/types";
import { feedService } from "@/services/feed";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { addOrder } = useOrders();
  const { favorites, toggleFavorite } = useFavorites();
  const { inquiryMode, startInquiry, completeInquiry } = useInquiry();
  const { selectedCategory, handleTagSelect } = useFilter();

  const [cakes, setCakes] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchFeeds = async (pageNum: number, isRefresh: boolean = false) => {
    if (loading || (!hasMore && !isRefresh)) return;
    
    try {
      setLoading(true);
      // 'all' 태그는 전체 검색을 의미하므로 빈 배열로 변환
      const tags = selectedCategory && selectedCategory !== 'all' ? [selectedCategory] : [];
      const response = await feedService.getFeeds(tags, pageNum, 12);
      
      if (isRefresh) {
        setCakes(response.content);
      } else {
        setCakes(prev => [...prev, ...response.content]);
      }
      
      setHasMore(!response.last);
      setPage(response.number);
    } catch (error) {
      console.error('Failed to load feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리(태그)가 변경될 때마다 0페이지부터 다시 로드
  useEffect(() => {
    fetchFeeds(0, true);
  }, [selectedCategory]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchFeeds(page + 1);
    }
  };

  const insets = useSafeAreaInsets();
  const tabBarHeightFromNavigator = useBottomTabBarHeight();
  const tabBarHeight =
    tabBarHeightFromNavigator > 0
      ? tabBarHeightFromNavigator
      : insets.bottom + 60;

  // Use the exported constant from AISearchBar to keep values in sync.
  const dynamicPaddingBottom = tabBarHeight + COLLAPSED_BAR_HEIGHT + 20;

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

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <Header
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
              cakes={cakes}
              onEndReached={handleLoadMore}
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
  },
});
