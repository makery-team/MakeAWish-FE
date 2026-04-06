import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Header } from '@/components/header';
import { AISearchBar } from '@/components/ai-search-bar';
import { RecommendationTags } from '@/components/recommendation-tags';
import { CakeGrid } from '@/components/cake-grid';
import { MapView } from '@/components/map-view';
import { ShopDetail } from '@/components/shop-detail';
import { EditorView } from '@/components/editor-view';
import { FloatingMapButton } from '@/components/floating-map-button';
import { BottomNavigation } from '@/components/bottom-navigation';
import { OrderStatus } from '@/components/order-status';
import { FavoritesView } from '@/components/favorites-view';
import { ReviewsView } from '@/components/reviews-view';

import { useNavigation } from '@/hooks/use-navigation';
import { useOrders } from '@/hooks/use-orders';
import { useFavorites } from '@/hooks/use-favorites';
import { useReviews } from '@/hooks/use-reviews';
import { useInquiry } from '@/hooks/use-inquiry';
import { useFilter } from '@/hooks/use-filter';

import { shouldShowHeader, shouldShowBottomNav, shouldShowMapButton, getActiveTab } from '@/utils/helpers';
import type { OrderData } from '@/types';

export default function HomeScreen() {
  // Custom hooks for state management
  const navigation = useNavigation();
  const { orders, addOrder } = useOrders();
  const { favorites, toggleFavorite, removeFavorite } = useFavorites();
  const { reviews, deleteReview } = useReviews();
  const { inquiryMode, startInquiry, completeInquiry, conversationHistory } = useInquiry();
  const { selectedCategory, handleTagSelect } = useFilter();

  // Handler for cake inquiry from grid
  const handleCakeInquiry = (image: string, shopName: string) => {
    startInquiry({
      image,
      shopName,
      design: '디자인 상세 선택',
    });
  };

  // Handler for inquiry from editor
  const handleEditorInquiry = () => {
    if (navigation.selectedCake) {
      startInquiry({
        image: navigation.selectedCake.image,
        shopName: navigation.selectedCake.shopName,
        design: conversationHistory.design || '에디터에서 수정된 디자인',
      });
    }
  };

  // Handler for completing inquiry
  const handleInquiryComplete = (orderData?: OrderData) => {
    completeInquiry();

    if (orderData) {
      addOrder(orderData);
      navigation.navigateToView('orders');
    }
  };

  // Handler for navigation from MyPage
  const handleNavigateToOrdersFromMyPage = () => {
    navigation.navigateToView('orders');
  };

  const handleNavigateToFavorites = () => {
    navigation.navigateToView('favorites');
  };

  const handleNavigateToReviews = () => {
    navigation.navigateToView('reviews');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      {shouldShowHeader(navigation.viewMode) && (
        <Header
          onNavigateToOrders={handleNavigateToOrdersFromMyPage}
          onNavigateToFavorites={handleNavigateToFavorites}
          onNavigateToReviews={handleNavigateToReviews}
        />
      )}

      {/* Content Area */}
      <View style={styles.content}>
        {/* AI Recommendation Tags */}
        {navigation.viewMode === 'list' && (
          <View style={styles.tagsContainer}>
            <RecommendationTags onTagSelect={handleTagSelect} />
          </View>
        )}

        {/* Main Content Views */}
        {navigation.viewMode === 'list' && (
          <View style={styles.viewContainer}>
            <CakeGrid
              onCakeSelect={navigation.handleCakeSelect}
              onCakeInquiry={handleCakeInquiry}
              selectedCategory={selectedCategory}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </View>
        )}

        {navigation.viewMode === 'map' && (
          <View style={styles.mapContainer}>
            <MapView onShopSelect={navigation.handleShopSelect} />
          </View>
        )}

        {navigation.viewMode === 'detail' && navigation.selectedShopId && (
          <ShopDetail
            shopId={navigation.selectedShopId}
            onBack={navigation.handleBackToMap}
            onCakeSelect={navigation.handleCakeSelect}
            onCakeInquiry={handleCakeInquiry}
          />
        )}

        {navigation.viewMode === 'editor' && navigation.selectedCake && (
          <EditorView
            image={navigation.selectedCake.image}
            shopName={navigation.selectedCake.shopName}
            onBack={navigation.selectedShopId ? navigation.handleBackToDetail : navigation.handleBackToList}
            onInquiry={handleEditorInquiry}
          />
        )}

        {navigation.viewMode === 'orders' && (
          <OrderStatus
            orders={orders}
            onBack={navigation.handleBackToHome}
          />
        )}

        {navigation.viewMode === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onBack={navigation.handleBackToHome}
            onCakeSelect={navigation.handleCakeSelect}
            onRemoveFavorite={removeFavorite}
          />
        )}

        {navigation.viewMode === 'reviews' && (
          <ReviewsView
            reviews={reviews}
            onBack={navigation.handleBackToHome}
            onDeleteReview={deleteReview}
          />
        )}
      </View>

      {/* Floating Action Button */}
      {shouldShowMapButton(navigation.viewMode) && (
        <FloatingMapButton
          viewMode={navigation.viewMode}
          onToggle={navigation.handleToggleView}
        />
      )}

      {/* AI Search Bar - Bottom Sheet */}
      <AISearchBar
        onCakeSelect={navigation.handleCakeSelect}
        inquiryMode={inquiryMode || undefined}
        onInquiryComplete={handleInquiryComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
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
    paddingBottom: 220, // Increased to account for BottomNav + Collapsed AISearchBar
  },
  mapContainer: {
    flex: 1,
    marginTop: 16,
    paddingBottom: 220, // Increased to account for BottomNav + Collapsed AISearchBar
  },
});
