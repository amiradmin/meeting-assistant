// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [initialized, setInitialized] = useState(false);
  const pollingRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Create axios instance with interceptors
  const api = axios.create({
    baseURL: 'http://192.168.150.10:8000',
    headers: { 'Content-Type': 'application/json' },
  });

  // Add request interceptor to include JWT token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle token expiration
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.log('Token expired or invalid');
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post('http://192.168.150.10:8000/api/token/refresh/', {
              refresh: refreshToken,
            });

            const newAccessToken = refreshResponse.data.access;
            localStorage.setItem('access_token', newAccessToken);

            // Retry the original request
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(error.config);
          } catch (refreshError) {
            // Refresh failed, clear tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.dispatchEvent(new Event('tokenExpired'));
          }
        } else {
          localStorage.removeItem('access_token');
          window.dispatchEvent(new Event('tokenExpired'));
        }
      }
      return Promise.reject(error);
    }
  );

  // Fetch recent notifications from backend
  const fetchNotifications = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('⏸️  Fetch already in progress, skipping...');
      return;
    }

    const token = localStorage.getItem('access_token');

    if (!token) {
      console.log('🔐 No access token found, skipping notification fetch');
      setNotifications([]);
      setTotalCount(0);
      setUnreadCount(0);
      setInitialized(true);
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);

      console.log('🔄 Starting notification fetch...');
      const response = await api.get("/api/notifications/noti/recent/");
      const data = response.data;

      console.log('✅ Notifications fetched:', {
        notifications: data.notifications?.length,
        total: data.total_count,
        unread: data.unread_count,
        time: new Date().toLocaleTimeString()
      });

      // Handle both response formats for backward compatibility
      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else if (Array.isArray(data)) {
        // Fallback for old API format
        setNotifications(data);
      } else {
        console.warn("Notifications response format not recognized:", data);
        setNotifications([]);
      }

      // Set counts from API response or calculate from notifications
      setTotalCount(data.total_count || data.notifications?.length || 0);
      setUnreadCount(data.unread_count || (data.notifications ? data.notifications.filter(n => !n.is_read).length : 0));

      setLastUpdate(new Date());
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);

      if (error.response?.status === 401) {
        console.log('🔐 Token invalid, clearing storage');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }

      setNotifications([]);
      setTotalCount(0);
      setUnreadCount(0);
    } finally {
      setLoading(false);
      setInitialized(true);
      isFetchingRef.current = false;
      console.log('🏁 Fetch completed');
    }
  };

  // Polling - ENABLED with 30 second intervals
  const startPolling = (interval = 30000) => {
    console.log(`🔄 Starting polling every ${interval/1000} seconds`);

    if (pollingRef.current) clearInterval(pollingRef.current);

    const token = localStorage.getItem('access_token');
    if (token) {
      pollingRef.current = setInterval(fetchNotifications, interval);
      console.log(`✅ Polling started every ${interval/1000} seconds`);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log('🛑 Stopped polling');
    }
  };

  // Manual refresh function
  const manualRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchNotifications();
  };

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/noti/${id}/mark-read/`);

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));

      console.log('📝 Notification marked as read locally');

    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.post("/api/notifications/noti/mark-all-read/");

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );

      // Reset unread count
      setUnreadCount(0);

      console.log('📝 All notifications marked as read locally');

    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };

  // Get unread count safely (fallback method)
  const getUnreadCount = () => {
    if (!Array.isArray(notifications)) return 0;
    return notifications.filter(n => !n.is_read).length;
  };

  // Listen for login events
  useEffect(() => {
    const handleUserLogin = () => {
      console.log('🎯 User logged in event received, fetching notifications');
      fetchNotifications();
      startPolling(30000);
    };

    const handleTokenExpired = () => {
      console.log('🔐 Token expired event received');
      stopPolling();
      setNotifications([]);
      setTotalCount(0);
      setUnreadCount(0);
    };

    // Listen for training completion events
    const handleTrainingComplete = () => {
      console.log('🎯 Training complete event received, refreshing notifications');
      fetchNotifications();
    };

    window.addEventListener('userLoggedIn', handleUserLogin);
    window.addEventListener('tokenExpired', handleTokenExpired);
    window.addEventListener('trainingComplete', handleTrainingComplete);

    return () => {
      window.removeEventListener('userLoggedIn', handleUserLogin);
      window.removeEventListener('tokenExpired', handleTokenExpired);
      window.removeEventListener('trainingComplete', handleTrainingComplete);
    };
  }, []);

  // Initial setup - WITH POLLING ENABLED
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log('🔍 NotificationProvider mounted, token exists:', !!token);

    if (token) {
      console.log('🚀 Initial fetch triggered');
      fetchNotifications();
      startPolling(30000); // Poll every 30 seconds
    } else {
      setInitialized(true);
    }

    return () => {
      stopPolling();
    };
  }, []);

  // Listen for storage changes (like when login happens in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'access_token') {
        console.log('🔑 Access token changed, refetching notifications');
        if (e.newValue) {
          fetchNotifications();
          startPolling(30000);
        } else {
          stopPolling();
          setNotifications([]);
          setTotalCount(0);
          setUnreadCount(0);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    notifications,
    totalCount,
    unreadCount,
    loading,
    initialized,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    lastUpdate,
    startPolling,
    stopPolling,
    manualRefresh, // Add manual refresh function
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};