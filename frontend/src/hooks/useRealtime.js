import { useState, useEffect, useCallback } from 'react';
import { plcWebSocket } from '../services/websocket';

export const useRealtime = (tags = null) => {
  const [realtimeData, setRealtimeData] = useState({});
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  useEffect(() => {
    const handleData = (data) => {
      if (tags && data) {
        const filtered = {};
        tags.forEach(tag => {
          if (data[tag] !== undefined) {
            filtered[tag] = data[tag];
          }
        });
        setRealtimeData(filtered);
      } else {
        setRealtimeData(data);
      }
    };

    const handleConnected = () => {
      setIsWebSocketConnected(true);
      // Subscribe to tags
      if (tags) {
        plcWebSocket.send({ action: 'subscribe', tags });
      }
    };

    const handleDisconnected = () => {
      setIsWebSocketConnected(false);
    };

    plcWebSocket.on('data', handleData);
    plcWebSocket.on('connected', handleConnected);
    plcWebSocket.on('disconnected', handleDisconnected);

    return () => {
      // Cleanup would go here in a real implementation
    };
  }, [tags]);

  return { realtimeData, isWebSocketConnected };
};