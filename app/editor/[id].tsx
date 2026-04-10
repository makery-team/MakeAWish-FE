import { EditorView } from "@/components/editor-view";
import { useInquiry } from "@/hooks/use-inquiry";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export default function EditorScreen() {
  const { image, shopName } = useLocalSearchParams<{
    id?: string;
    image?: string;
    shopName?: string;
  }>();
  const router = useRouter();
  const { startInquiry, conversationHistory } = useInquiry();

  const safeImage = typeof image === "string" ? image : "";
  const safeShopName = typeof shopName === "string" ? shopName : "";

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

  const handleInquiry = () => {
    if (!safeImage || !safeShopName) return;

    startInquiry({
      image: safeImage,
      shopName: safeShopName,
      design: conversationHistory.design || "에디터에서 수정된 디자인",
    });
  };

  if (!safeImage || !safeShopName) return null;

  return (
    <EditorView
      image={safeImage}
      shopName={safeShopName}
      onBack={handleBack}
      onInquiry={handleInquiry}
    />
  );
}
