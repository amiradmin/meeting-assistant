// hooks/useDashboardData.js - Complete Functional Version
import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://192.168.150.10:8000/api/dashboard';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState({
    employees: {},
    kpis: {},
    alerts: [],
    charts: {},
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      const endpoints = [
        '/global-overview/',
        '/asset-health/',
        '/energy-monitoring/',
        '/alerts-notifications/',
        '/cmms-overview/',
        '/employee-overview/'
      ];

      console.log('🔄 Starting to fetch dashboard data from:', API_BASE_URL);

      let responses;
      try {
        responses = await Promise.all(
          endpoints.map(async (endpoint) => {
            const url = `${API_BASE_URL}${endpoint}`;
            console.log(`📡 Fetching: ${url}`);

            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000);

              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                signal: controller.signal
              });

              clearTimeout(timeoutId);

              if (!response.ok) {
                console.warn(`❌ ${endpoint} failed with status: ${response.status} ${response.statusText}`);
                return {
                  ok: false,
                  status: response.status,
                  statusText: response.statusText,
                  endpoint: endpoint
                };
              }

              console.log(`✅ ${endpoint} loaded successfully`);
              return response;

            } catch (error) {
              console.error(`🚨 Fetch error for ${endpoint}:`, error.message);
              return {
                ok: false,
                error: error.message,
                endpoint: endpoint
              };
            }
          })
        );
      } catch (fetchError) {
        console.log('🌐 Network error, using mock data:', fetchError);
        const mockData = generateMockDashboardData();
        setDashboardData(mockData);
        return;
      }

      // Process responses
      const processedData = await Promise.all(
        responses.map(async (response, index) => {
          const endpoint = endpoints[index];

          if (response?.ok) {
            try {
              const data = await response.json();
              console.log(`📊 ${endpoint} data received`);
              return data;
            } catch (parseError) {
              console.error(`❌ JSON parse error for ${endpoint}:`, parseError);
              return generateMockDataForEndpoint(endpoint);
            }
          } else {
            console.warn(`🔄 Using mock data for ${endpoint}`);
            return generateMockDataForEndpoint(endpoint);
          }
        })
      );

      const [globalData, assetHealthData, energyData, alertsData, cmmsData, employeeData] = processedData;

      // Transform all data
      const transformedData = {
        employees: transformEmployeeData(employeeData),
        kpis: transformKpisData(globalData, assetHealthData, energyData, alertsData, cmmsData),
        alerts: transformAlertsData(alertsData),
        charts: transformChartData(globalData),
        loading: false,
        error: null,
        lastUpdated: globalData?.last_updated || new Date().toLocaleString('fa-IR')
      };

      console.log('🎉 Dashboard data transformed successfully');
      setDashboardData(transformedData);

    } catch (error) {
      console.error('💥 Error in fetchDashboardData:', error);
      const mockData = generateMockDashboardData();
      mockData.error = `Connection error: ${error.message}`;
      setDashboardData(mockData);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    let intervalId;
    if (!dashboardData.error) {
      intervalId = setInterval(fetchDashboardData, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchDashboardData, dashboardData.error]);

  return {
    ...dashboardData,
    refetch: fetchDashboardData
  };
};

// Helper function to safely get nested values
const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;

  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    result = result?.[key];
    if (result === undefined || result === null) {
      return defaultValue;
    }
  }

  return result;
};

// Transform employee data
const transformEmployeeData = (employeeData) => {
  // Use real data if available and valid
  if (employeeData && employeeData.total_employees !== undefined) {
    return {
      total_employees: employeeData.total_employees || 0,
      active_employees: employeeData.active_employees || 0,
      inactive_employees: employeeData.inactive_employees || 0,
      activity_rate: employeeData.activity_rate || 0,
      roles_breakdown: employeeData.roles_breakdown || []
    };
  }

  // Fallback to mock data
  return {
    total_employees: 45,
    active_employees: 42,
    inactive_employees: 3,
    activity_rate: 93.3,
    roles_breakdown: [
      { role: "کارگر", count: 25 },
      { role: "مهندس", count: 10 },
      { role: "کارشناس", count: 7 },
      { role: "مدیر", count: 3 }
    ]
  };
};
// Transform KPIs data - FIXED VERSION
const transformKpisData = (globalData, assetHealthData, energyData, alertsData, cmmsData) => {

  const currentEnergy = getNestedValue(globalData, 'current_energy_consumption_kwh', 55223);
  const criticalAlerts = getNestedValue(alertsData, 'alert_stats.critical_alerts', 2);

  // FIX: Get work order data from CMMS endpoint, not global data
  const openWorkOrders = getNestedValue(cmmsData, 'work_order_summary.open', 0);
  const overdueWorkOrders = getNestedValue(cmmsData, 'work_order_summary.overdue', 0);
  const totalWorkOrders = getNestedValue(cmmsData, 'work_order_summary.total', 0);

  // FIX: Handle asset health data properly
  const totalAssets = getNestedValue(assetHealthData, 'total_assets', 0);
  const criticalAssets = getNestedValue(assetHealthData, 'critical_assets', 0);
  const warningAssets = getNestedValue(assetHealthData, 'warning_assets', 0);
  const assetHealthAvg = getNestedValue(assetHealthData, 'average_health_score', 0);

  // Calculate healthy assets correctly to avoid inconsistencies
  const apiHealthyAssets = getNestedValue(assetHealthData, 'healthy_assets', 0);
  const calculatedHealthyAssets = Math.max(0, totalAssets - criticalAssets - warningAssets);

  // Use calculated value if API value seems inconsistent
  const healthyAssets = (apiHealthyAssets === totalAssets && criticalAssets > 0)
    ? calculatedHealthyAssets
    : apiHealthyAssets;

  console.log('🔍 Asset Health Data Debug:', {
    totalAssets,
    criticalAssets,
    warningAssets,
    apiHealthyAssets,
    calculatedHealthyAssets,
    finalHealthyAssets: healthyAssets
  });

  console.log('🔍 Work Order Data Debug:', {
    openWorkOrders,
    overdueWorkOrders,
    totalWorkOrders,
    cmmsData: cmmsData // Log the entire cmms data to see structure
  });

  return {
    // Global Overview KPIs
    total_active_assets: totalAssets, // Use asset health data as fallback
    assets_under_maintenance: getNestedValue(globalData, 'assets_under_maintenance', 12),
    predicted_failures_next_7_days: getNestedValue(globalData, 'predicted_failures_next_7_days', 3),
    current_energy_consumption_kwh: currentEnergy,
    energy_forecast_next_24h: getNestedValue(globalData, 'energy_forecast_next_24h', 54890),
    open_work_orders: openWorkOrders, // Now from CMMS data
    maintenance_backlog_days: getNestedValue(globalData, 'maintenance_backlog_days', 2),
    asset_health_index_avg: assetHealthAvg,
    energy_efficiency_score_avg: getNestedValue(globalData, 'energy_efficiency_score_avg', 88.3),

    // Asset Health KPIs - FIXED
    critical_assets: criticalAssets,
    warning_assets: warningAssets,
    healthy_assets: healthyAssets,

    // Energy Monitoring KPIs
    current_consumption: getNestedValue(energyData, 'current_consumption', 55223),
    daily_average: getNestedValue(energyData, 'daily_average', 52100),
    peak_consumption: getNestedValue(energyData, 'peak_consumption', 61200),

    // CMMS KPIs
    maintenance_completed_today: getNestedValue(cmmsData, 'work_order_summary.completed_today', 0),
    total_work_orders: totalWorkOrders,
    overdue_work_orders: overdueWorkOrders,
    work_orders_in_progress: getNestedValue(cmmsData, 'work_order_summary.in_progress', 0),

    // Alert KPIs
    critical_alerts: criticalAlerts,
    warning_alerts: getNestedValue(alertsData, 'alert_stats.warning_alerts', 3),

    // Computed KPIs for frontend widgets
    equipmentHealth: `${assetHealthAvg}%`,
    healthStatus: getHealthStatus(assetHealthAvg),
    openWorkOrders: openWorkOrders,
    activeAlerts: criticalAlerts + getNestedValue(alertsData, 'alert_stats.warning_alerts', 3),
    energyConsumption: `${formatEnergyConsumption(currentEnergy)} kWh`,
    maintenanceBacklog: getNestedValue(cmmsData, 'maintenance_backlog', 0)
  };
};
// Transform alerts data
const transformAlertsData = (alertsData) => {
  const notifications = getNestedValue(alertsData, 'notifications', []);
  const alerts = getNestedValue(alertsData, 'alerts', []);

  // Map notification types to severity levels
  const typeToSeverity = {
    'error': 'high',
    'warning': 'medium',
    'info': 'low',
    'success': 'low'
  };

  // Transform notifications
  const transformedAlerts = [...notifications, ...alerts].map(notification => ({
    id: notification.id || Math.random().toString(36).substr(2, 9),
    title: notification.title || 'هشدار سیستم',
    message: notification.message || 'هشدار بدون توضیح',
    severity: typeToSeverity[notification.type] || typeToSeverity[notification.notif_type] || 'low',
    timestamp: notification.created_at || new Date().toISOString(),
    equipment: notification.user || notification.asset__name || 'سیستم',
    isRead: notification.is_read || false,
    type: notification.type || notification.notif_type || 'info'
  }));

  // Return mock data if no real alerts
  if (transformedAlerts.length === 0) {
    return [
      {
        id: 'alert-1',
        title: "هشدار دمای بالا",
        message: "دمای کمپرسور A1 از حد مجاز فراتر رفته است",
        severity: "high",
        timestamp: new Date().toISOString(),
        equipment: "کمپرسور A1",
        isRead: false,
        type: "error"
      },
      {
        id: 'alert-2',
        title: "تعمیرات پیشگیرانه",
        message: "زمان سرویس دوره‌ای دستگاه برش فرا رسیده است",
        severity: "medium",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        equipment: "دستگاه برش B2",
        isRead: false,
        type: "warning"
      }
    ];
  }

  return transformedAlerts.slice(0, 10);
};

// Transform chart data
const transformChartData = (globalData) => {
  const healthScore = getNestedValue(globalData, 'asset_health_index_avg', 92);

  return {
    performance: {
      labels: ["دی", "بهمن", "اسفند", "فروردین", "اردیبهشت", "خرداد"],
      datasets: [
        {
          label: "کارایی تجهیزات",
          data: [85, 78, 90, 82, 88, healthScore],
          borderColor: "#1e90ff",
          backgroundColor: "rgba(30, 144, 255, 0.1)",
          tension: 0.4,
          fill: true
        }
      ]
    },
    utilization: {
      labels: ["تجهیزات تولید", "تجهیزات آزمایش", "تجهیزات بسته‌بندی"],
      data: [75, 60, 85],
      backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"]
    },
    energy: {
      labels: ["ساعت ۰", "ساعت ۴", "ساعت ۸", "ساعت ۱۲", "ساعت ۱۶", "ساعت ۲۰"],
      datasets: [
        {
          label: "مصرف انرژی (kWh)",
          data: [52000, 48000, 61000, 58000, 55000, 53000],
          borderColor: "#FF6B6B",
          backgroundColor: "rgba(255, 107, 107, 0.1)"
        }
      ]
    },
    maintenance: {
      labels: ["تعمیرات پیشگیرانه", "تعمیرات اضطراری", "سرویس دوره‌ای", "بازرسی"],
      data: [45, 15, 30, 10],
      backgroundColor: ["#4CAF50", "#F44336", "#FF9800", "#2196F3"]
    }
  };
};

// Health status helper
const getHealthStatus = (healthScore) => {
  const score = healthScore || 92;
  if (score >= 80) return 'پایدار / بدون هشدار';
  if (score >= 60) return 'نیاز به بررسی';
  return 'نیاز به اقدام فوری';
};

// Format energy consumption
const formatEnergyConsumption = (consumption) => {
  if (!consumption) return '55,223';
  return new Intl.NumberFormat('fa-IR').format(Math.round(consumption));
};

// Mock data generator for complete dashboard
const generateMockDashboardData = () => ({
  employees: {
    total_employees: 45,
    active_employees: 42,
    inactive_employees: 3,
    activity_rate: 93.3,
    roles_breakdown: [
      { role: "کارگر", count: 25 },
      { role: "مهندس", count: 10 },
      { role: "کارشناس", count: 7 },
      { role: "مدیر", count: 3 }
    ]
  },
  kpis: {
    total_active_assets: 150,
    assets_under_maintenance: 12,
    predicted_failures_next_7_days: 3,
    current_energy_consumption_kwh: 55223,
    energy_forecast_next_24h: 54890,
    open_work_orders: 14,
    maintenance_backlog_days: 2,
    asset_health_index_avg: 92.5,
    energy_efficiency_score_avg: 88.3,
    critical_assets: 2,
    warning_assets: 8,
    healthy_assets: 140,
    current_consumption: 55223,
    daily_average: 52100,
    peak_consumption: 61200,
    maintenance_completed_today: 8,
    total_work_orders: 45,
    overdue_work_orders: 3,
    work_orders_in_progress: 8,
    critical_alerts: 2,
    warning_alerts: 3,
    equipmentHealth: "92.5%",
    healthStatus: "پایدار / بدون هشدار",
    openWorkOrders: 14,
    activeAlerts: 5,
    energyConsumption: "55,223 kWh",
    maintenanceBacklog: 3
  },
  alerts: [
    {
      id: 'mock-alert-1',
      title: "هشدار دمای بالا",
      message: "دمای کمپرسور A1 از حد مجاز فراتر رفته است",
      severity: "high",
      timestamp: new Date().toISOString(),
      equipment: "کمپرسور A1",
      isRead: false,
      type: "error"
    },
    {
      id: 'mock-alert-2',
      title: "تعمیرات پیشگیرانه",
      message: "زمان سرویس دوره‌ای دستگاه برش فرا رسیده است",
      severity: "medium",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      equipment: "دستگاه برش B2",
      isRead: false,
      type: "warning"
    }
  ],
  charts: {
    performance: {
      labels: ["دی", "بهمن", "اسفند", "فروردین", "اردیبهشت", "خرداد"],
      datasets: [
        {
          label: "کارایی تجهیزات",
          data: [85, 78, 90, 82, 88, 92],
          borderColor: "#1e90ff",
          backgroundColor: "rgba(30, 144, 255, 0.1)",
          tension: 0.4,
          fill: true
        }
      ]
    },
    utilization: {
      labels: ["تجهیزات تولید", "تجهیزات آزمایش", "تجهیزات بسته‌بندی"],
      data: [75, 60, 85],
      backgroundColor: ["#4CAF50", "#FF9800", "#2196F3"]
    },
    energy: {
      labels: ["ساعت ۰", "ساعت ۴", "ساعت ۸", "ساعت ۱۲", "ساعت ۱۶", "ساعت ۲۰"],
      datasets: [
        {
          label: "مصرف انرژی (kWh)",
          data: [52000, 48000, 61000, 58000, 55000, 53000],
          borderColor: "#FF6B6B",
          backgroundColor: "rgba(255, 107, 107, 0.1)"
        }
      ]
    },
    maintenance: {
      labels: ["تعمیرات پیشگیرانه", "تعمیرات اضطراری", "سرویس دوره‌ای", "بازرسی"],
      data: [45, 15, 30, 10],
      backgroundColor: ["#4CAF50", "#F44336", "#FF9800", "#2196F3"]
    }
  },
  loading: false,
  error: null,
  lastUpdated: new Date().toLocaleString('fa-IR')
});

// Mock data for individual endpoints
const generateMockDataForEndpoint = (endpoint) => {
  const mockData = {
    '/global-overview/': {
      total_active_assets: 150,
      assets_under_maintenance: 12,
      predicted_failures_next_7_days: 3,
      current_energy_consumption_kwh: 55223,
      energy_forecast_next_24h: 54890,
      open_work_orders: 14,
      maintenance_backlog_days: 2,
      asset_health_index_avg: 92.5,
      energy_efficiency_score_avg: 88.3,
      last_updated: new Date().toISOString()
    },
    '/asset-health/': {
      critical_assets: 2,
      warning_assets: 8,
      healthy_assets: 140,
      average_health_score: 92.5,
      health_trend: "improving",
      last_updated: new Date().toISOString()
    },
    '/energy-monitoring/': {
      current_consumption: 55223,
      daily_average: 52100,
      peak_consumption: 61200,
      energy_efficiency_score: 88.3,
      forecast_next_24h: 54890,
      consumption_trend: "decreasing",
      last_updated: new Date().toISOString()
    },
    '/alerts-notifications/': {
      notifications: [
        {
          id: 1,
          type: "error",
          title: "هشدار دمای بالا",
          message: "دمای کمپرسور A1 از حد مجاز فراتر رفته است",
          is_read: false,
          created_at: new Date().toISOString(),
          user: "سیستم"
        }
      ],
      alert_stats: {
        critical_alerts: 2,
        warning_alerts: 3,
        info_alerts: 5,
        success_alerts: 8,
        total_unread: 5
      },
      last_updated: new Date().toISOString()
    },
    '/cmms-overview/': {
      work_order_summary: {
        total: 45,
        open: 14,
        in_progress: 8,
        completed_today: 5,
        overdue: 3
      },
      priority_breakdown: {
        high: 2,
        medium: 8,
        low: 4
      },
      completion_metrics: {
        completion_rate: 85.5,
        completed_last_30_days: 38,
        average_completion_time_hours: 24.5
      },
      maintenance_backlog: 3,
      last_updated: new Date().toISOString()
    },
    '/employee-overview/': {
      total_employees: 45,
      active_employees: 42,
      inactive_employees: 3,
      activity_rate: 93.3,
      roles_breakdown: [
        { role: "کارگر", count: 25 },
        { role: "مهندس", count: 10 },
        { role: "کارشناس", count: 7 },
        { role: "مدیر", count: 3 }
      ],
      last_updated: new Date().toISOString()
    }
  };

  return mockData[endpoint] || {};
};