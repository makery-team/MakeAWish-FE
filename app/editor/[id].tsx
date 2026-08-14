import { EditorView } from "@/components/editor-view";
import { useInquiry } from "@/hooks/use-inquiry";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export default function EditorScreen() {
  const { id, image, shopName, storeId, productId } = useLocalSearchParams<{
    id?: string;
    image?: string;
    shopName?: string;
    storeId?: string;
    productId?: string;
  }>();
  const router = useRouter();
  const { startInquiry, conversationHistory } = useInquiry();

  const safeImage = typeof image === "string" ? image : "";
  const safeShopName = typeof shopName === "string" ? shopName : "";
  const parsedStoreId = storeId ? parseInt(storeId, 10) : undefined;
  const parsedProductId = productId ? parseInt(productId, 10) : undefined;

  React.useEffect(() => {
    if (safeImage && safeShopName) return;
    router.replace("/(tabs)");
  }, [router, safeImage, safeShopName]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleInquiry = (editedImage?: string) => {
    if (!safeImage || !safeShopName) return;

    startInquiry({
      image: editedImage || safeImage,
      shopName: safeShopName,
      storeId: parsedStoreId,
      productId: parsedProductId,
      portfolioId: id && !isNaN(parseInt(id, 10)) ? parseInt(id, 10) : undefined,
      design: conversationHistory.design || "에디터에서 수정된 디자인",
      customizedImageUrl: editedImage || safeImage,
    });
    
    // 에디터를 닫고 AI 채팅(홈 화면)으로 다이렉트 이동
    router.replace("/(tabs)");
  };

  if (!safeImage || !safeShopName) return null;

  return (
    <EditorView
      image={safeImage}
      shopName={safeShopName}
      portfolioId={id && !isNaN(parseInt(id, 10)) ? parseInt(id, 10) : 1}
      onBack={handleBack}
      onInquiry={handleInquiry}
    />
  );
}
