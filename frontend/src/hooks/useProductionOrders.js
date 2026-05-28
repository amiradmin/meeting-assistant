// src/hooks/useProductionOrders.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/production';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const useProductionOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrders = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.customer) params.append('customer', filters.customer);

      const url = `/orders/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axiosInstance.get(url);

      const data = response.data;
      setOrders(data.results || data);
      setTotalCount(data.count || (data.results ? data.results.length : data.length));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData) => {
    try {
      const response = await axiosInstance.post('/orders/', orderData);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error creating order:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchOrders]);

  const updateOrder = useCallback(async (orderId, orderData) => {
    try {
      const response = await axiosInstance.patch(`/orders/${orderId}/`, orderData);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating order:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchOrders]);

  const deleteOrder = useCallback(async (orderId) => {
    try {
      await axiosInstance.delete(`/orders/${orderId}/`);
      await fetchOrders();
      return { success: true };
    } catch (err) {
      console.error('Error deleting order:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchOrders]);

  const confirmOrder = useCallback(async (orderId) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/confirm/`);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error confirming order:', err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }, [fetchOrders]);

  const startProduction = useCallback(async (orderId) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/start_production/`);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error starting production:', err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }, [fetchOrders]);

  const completeOrder = useCallback(async (orderId) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/complete/`);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error completing order:', err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }, [fetchOrders]);

  const cancelOrder = useCallback(async (orderId) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/cancel/`);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error cancelling order:', err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  }, [fetchOrders]);

  const addHeatToOrder = useCallback(async (orderId, heatData) => {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/add_heat/`, heatData);
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error adding heat:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, [fetchOrders]);

  const getOrderHeats = useCallback(async (orderId) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}/heats/`);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error fetching heats:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  }, []);

  return {
    orders,
    loading,
    error,
    totalCount,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    confirmOrder,
    startProduction,
    completeOrder,
    cancelOrder,
    addHeatToOrder,
    getOrderHeats,
  };
};