import { useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DirectChatMessage } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://make-a-wish-env.eba-dvjn7a8x.ap-northeast-2.elasticbeanstalk.com";

export function useChatSocket(roomNumber?: number, myUserId?: number) {
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        console.error("No auth token for websocket");
        return;
      }

      // HTTP URL을 WS URL로 변환하고 쿼리 파라미터(roomNumber, userId) 추가
      let wsUrl = API_BASE_URL.replace(/^http/, 'ws') + `/chats`;
      if (roomNumber && myUserId) {
        wsUrl += `?roomNumber=${roomNumber}&userId=${myUserId}`;
      }
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket Connected");
        setIsConnected(true);
        // 연결 후 백엔드가 요구하는 인증 절차가 있다면 여기서 수행 (예: token 전송)
        // Spring 백엔드는 쿼리스트링이나 헤더로 받기 어려울 때 첫 메시지로 토큰을 받을 수 있음
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket received message:", data);
          // 받은 메시지가 현재 방의 메시지인지 확인 후 상태 업데이트
          if (data.roomNumber === roomNumber) {
            setMessages((prev) => [...prev, data]);
          }
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket Closed:", event.code, event.reason);
        setIsConnected(false);
        // 재연결 로직이 필요하다면 여기에 추가
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Failed to connect websocket", err);
    }
  }, [roomNumber]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && roomNumber && myUserId) {
      const payload = {
        userId: myUserId,
        message: content,
        imageUrl: null,
        roomNumber,
      };
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("WebSocket is not connected or roomNumber is missing");
    }
  }, [roomNumber]);

  useEffect(() => {
    if (roomNumber) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [roomNumber, connect, disconnect]);

  return {
    messages,
    setMessages, // 초기 대화 기록 세팅용
    isConnected,
    sendMessage,
  };
}
