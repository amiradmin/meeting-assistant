// src/components/dashboard/ProductionOverview.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductionOverview.css';

const API_BASE_URL = 'http://localhost:8000/api';


const ProductionOverview = () => {
  const [productionData, setProductionData] = useState({
    totalProduction: 0,
    dailyTarget: 1500,
    monthlyProduction: 0,
    efficiency: 92.5,
    availability: 96.2,
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Axios instance with auth
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

  useEffect(() => {
    fetchProductionData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchProductionData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchProductionData = async () => {
    setLoading(true);
    try {
      // Fetch heats data
      const heatsResponse = await axiosInstance.get('/lf/heats/');
      const heats = heatsResponse.data.results || heatsResponse.data;

      // Fetch production orders data
      const ordersResponse = await axiosInstance.get('/production/orders/');
      const orders = ordersResponse.data.results || ordersResponse.data;

      // Calculate production metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Today's production from heats completed today
      const todayProduction = heats
        .filter(heat => {
          const endTime = heat.end_time ? new Date(heat.end_time) : null;
          return heat.status === 'completed' && endTime && endTime >= today;
        })
        .reduce((sum, heat) => sum + (heat.liquid_weight || 0), 0);

      // Monthly production
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyProduction = heats
        .filter(heat => {
          const endTime = heat.end_time ? new Date(heat.end_time) : null;
          return heat.status === 'completed' && endTime && endTime >= firstDayOfMonth;
        })
        .reduce((sum, heat) => sum + (heat.liquid_weight || 0), 0);

      // Calculate efficiency (based on planned vs actual)
      const completedOrders = orders.filter(order => order.status === 'completed');
      let totalPlanned = 0;
      let totalActual = 0;
      completedOrders.forEach(order => {
        totalPlanned += parseFloat(order.quantity_tons);
        totalActual += parseFloat(order.completed_quantity || 0);
      });
      const efficiency = totalPlanned > 0 ? (totalActual / totalPlanned * 100) : 92.5;

      setProductionData({
        totalProduction: todayProduction,
        dailyTarget: 1500,
        monthlyProduction: monthlyProduction,
        efficiency: Math.round(efficiency),
        availability: 96.2,
        lastUpdated: new Date()
      });

    } catch (err) {
      console.error('Error fetching production data:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Today\'s Production',
      value: `${Math.floor(productionData.totalProduction)}`,
      unit: 'tons',
      icon: 'fas fa-industry',
      color: 'primary',
      trend: '+2.5%',
      trendDirection: 'up',
      subtitle: 'vs yesterday'
    },
    {
      title: 'Monthly Production',
      value: `${Math.floor(productionData.monthlyProduction)}`,
      unit: 'tons',
      icon: 'fas fa-calendar-alt',
      color: 'info',
      trend: '+8.3%',
      trendDirection: 'up',
      subtitle: 'vs last month'
    },
    {
      title: 'Efficiency',
      value: `${productionData.efficiency}`,
      unit: '%',
      icon: 'fas fa-chart-line',
      color: 'success',
      trend: '+1.2%',
      trendDirection: 'up',
      subtitle: 'Production efficiency'
    },
    {
      title: 'Daily Target',
      value: `${productionData.dailyTarget}`,
      unit: 'tons',
      icon: 'fas fa-bullseye',
      color: 'danger',
      progress: ((productionData.totalProduction / productionData.dailyTarget) * 100).toFixed(1),
      subtitle: 'Remaining: ' + Math.max(0, productionData.dailyTarget - productionData.totalProduction).toFixed(0) + ' tons'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-chart-bar"></i>
            Production Overview
          </h3>
        </div>
        <div className="card-body">
          <div className="production-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading production data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-chart-bar"></i>
            Production Overview
          </h3>
        </div>
        <div className="card-body">
          <div className="production-error">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Error loading production data</p>
            <button onClick={fetchProductionData} className="btn-retry-small">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">
          <i className="fas fa-chart-bar"></i>
          Production Overview
        </h3>
        <div className="card-actions">
          <span className="text-muted">
            Last Updated: {productionData.lastUpdated.toLocaleTimeString()}
          </span>
          <button onClick={fetchProductionData} className="btn-refresh-small" title="Refresh">
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="production-overview four-cards">
          {metrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className={`metric-icon ${metric.color}`}>
                <i className={metric.icon}></i>
              </div>
              <div className="metric-content">
                <div className="metric-label">{metric.title}</div>
                <div className="metric-value">
                  {metric.value}
                  <small className="unit">{metric.unit}</small>
                </div>
                <div className="metric-subtitle">{metric.subtitle}</div>

                {metric.trend && (
                  <div className={`metric-trend trend-${metric.trendDirection}`}>
                    <i className={`fas fa-arrow-${metric.trendDirection === 'up' ? 'up' : 'down'}`}></i>
                    {metric.trend}
                  </div>
                )}

                {metric.progress && (
                  <div className="progress-container">
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${Math.min(parseFloat(metric.progress), 100)}%` }}
                        aria-valuenow={metric.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {metric.progress}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionOverview;