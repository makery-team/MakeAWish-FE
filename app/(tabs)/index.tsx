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

import type { OrderData, FeedItem, OrderCreateRequest } from "@/types";
import { feedService } from "@/services/feed";
import { orderService } from "@/services/order";

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
  const handleCakeInquiry = (image: string, shopName: string, portfolioId?: number, storeId?: number, productId?: number, tags?: string[]) => {
    startInquiry({
      image,
      shopName,
      portfolioId,
      storeId,
      productId,
      tags,
      design: "디자인 상세 선택",
    });
  };

  // Handler for completing inquiry
  const handleInquiryComplete = async (orderData?: OrderData) => {
    completeInquiry();

    if (orderData) {
      try {
        // 백엔드로 실제 주문 생성 API 호출
        // 임시로 없으면 1로 fallback (추후 완벽 연동 전까지 앱이 죽지 않도록 방어)
        const storeId = orderData.storeId || 1; 
        const productId = orderData.productId || 1;
        const portfolioId = orderData.portfolioId;
        
        // 날짜/시간 동적 추출 로직 (AI가 뱉은 한국어 키 파싱)
        let formattedDate = new Date().toISOString().split('.')[0]; // 기본값: 현재 시간
        const dateKey = Object.keys(orderData).find(k => k.includes('날짜') || k.includes('일') || k.includes('date'));
        const timeKey = Object.keys(orderData).find(k => k.includes('시간') || k.includes('시') || k.includes('time'));
        
        try {
          if (dateKey && timeKey) {
             const d = orderData[dateKey];
             const t = orderData[timeKey];
             formattedDate = `${d}T${t}:00`;
          } else if (dateKey) {
             const d = orderData[dateKey];
             if (d.includes(' ')) {
                formattedDate = d.replace(' ', 'T') + ':00';
             } else {
                formattedDate = `${d}T00:00:00`;
             }
          }
        } catch (e) {
          console.warn("Date parsing fallback:", e);
        }

        // 백엔드(Spring) 400 에러 방어: ISO 8601 형식인지 검사. (YYYY-MM-DDTHH:mm:ss)
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
        if (!isoRegex.test(formattedDate)) {
            console.warn("Invalid formattedDate:", formattedDate, "Falling back to current date.");
            formattedDate = new Date().toISOString().split('.')[0];
        }

        const requestPayload: OrderCreateRequest = {
          storeId,
          pickupDate: formattedDate,
          orderData: { ...orderData }, // 동적 키(맛, 사이즈 등) 원형 그대로 전송
          items: [
            {
              productId,
              quantity: 1,
              portfolioId: portfolioId,
            }
          ]
        };

        await orderService.createOrder(requestPayload);
        
        // 로컬 상태에도 추가 (UI 반영용)
        addOrder(orderData);
        router.push("/orders");
      } catch (error) {
        console.error("Failed to create order:", error);
        // 에러 처리: Alert 띄우기 등 가능
        // 실패하더라도 일단 화면 이동은 시켜줄지 선택 (여기선 그대로 이동)
        addOrder(orderData);
        router.push("/orders");
      }
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
              onToggleFavorite={(cakeId, image, shopName, tag) => {
                const currentlyFavorited = favorites.some(f => f.id === cakeId.toString());
                toggleFavorite(cakeId, image, shopName, tag);
                setCakes(prev => prev.map(cake => 
                  cake.id === cakeId 
                    ? { ...cake, likeCount: currentlyFavorited ? Math.max(0, cake.likeCount - 1) : cake.likeCount + 1 }
                    : cake
                ));
              }}
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
        onCakeSelect={(image: string, shopName: string, portfolioId?: number) => {
          router.push({
            pathname: "/editor/[id]",
            params: { id: portfolioId ? portfolioId.toString() : "ai", image, shopName },
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
