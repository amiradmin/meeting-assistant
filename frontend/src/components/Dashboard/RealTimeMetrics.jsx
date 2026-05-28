// src/components/dashboard/RealTimeMetrics.jsx
import React, { useState, useEffect } from 'react';
import './RealTimeMetrics.css';

const RealTimeMetrics = ({ data }) => {
  const [metrics, setMetrics] = useState({
    powerConsumption: 850,
    energyCost: 1250000,
    temperature: 1650,
    carbonContent: 0.45,
    oxygenFlow: 2850,
    castingSpeed: 1.8,
    pressure: 4.2,
    coolingWater: 42
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        powerConsumption: Math.max(800, Math.min(900, prev.powerConsumption + (Math.random() - 0.5) * 10)),
        energyCost: prev.energyCost,
        temperature: Math.max(1640, Math.min(1660, prev.temperature + (Math.random() - 0.5) * 2)),
        carbonContent: Math.max(0.40, Math.min(0.50, prev.carbonContent + (Math.random() - 0.5) * 0.02)),
        oxygenFlow: Math.max(2800, Math.min(2900, prev.oxygenFlow + (Math.random() - 0.5) * 20)),
        castingSpeed: Math.max(1.7, Math.min(1.9, prev.castingSpeed + (Math.random() - 0.5) * 0.05)),
        pressure: Math.max(4.0, Math.min(4.4, prev.pressure + (Math.random() - 0.5) * 0.1)),
        coolingWater: Math.max(40, Math.min(44, prev.coolingWater + (Math.random() - 0.5) * 0.5))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const gaugeMetrics = [
    {
      id: 'power',
      title: 'مصرف برق',
      value: metrics.powerConsumption,
      unit: 'مگاوات',
      icon: 'fas fa-bolt',
      min: 0,
      max: 1000,
      warningThreshold: 850,
      dangerThreshold: 900,
      color: '#3b82f6'
    },
    {
      id: 'temperature',
      title: 'دمای مذاب',
      value: metrics.temperature,
      unit: 'درجه سانتی‌گراد',
      icon: 'fas fa-thermometer-half',
      min: 1500,
      max: 1800,
      warningThreshold: 1750,
      dangerThreshold: 1780,
      color: '#ef4444'
    },
    {
      id: 'pressure',
      title: 'فشار سیستم',
      value: metrics.pressure,
      unit: 'بار',
      icon: 'fas fa-tachometer-alt',
      min: 0,
      max: 6,
      warningThreshold: 4.5,
      dangerThreshold: 5.0,
      color: '#10b981'
    }
  ];

  const numericMetrics = [
    {
      id: 'carbon',
      title: 'میزان کربن',
      value: metrics.carbonContent.toFixed(2),
      unit: '%',
      icon: 'fas fa-atom',
      trend: '+0.02',
      status: 'normal',
      target: '0.40-0.50'
    },
    {
      id: 'oxygen',
      title: 'جریان اکسیژن',
      value: metrics.oxygenFlow.toLocaleString('fa-IR'),
      unit: 'مترمکعب/ساعت',
      icon: 'fas fa-wind',
      trend: '-15',
      status: 'good',
      target: '2800-2900'
    },
    {
      id: 'speed',
      title: 'سرعت ریخته‌گری',
      value: metrics.castingSpeed.toFixed(1),
      unit: 'متر/دقیقه',
      icon: 'fas fa-tachometer-alt',
      trend: '0.0',
      status: 'optimal',
      target: '1.8'
    },
    {
      id: 'cooling',
      title: 'دمای آب خنک‌کننده',
      value: metrics.coolingWater,
      unit: 'درجه',
      icon: 'fas fa-water',
      trend: '+0.5',
      status: 'warning',
      target: '40-42'
    }
  ];

  const calculateGaugePercentage = (value, min, max) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getStatusColor = (value, warning, danger) => {
    if (value >= danger) return '#ef4444';
    if (value >= warning) return '#f59e0b';
    return '#10b981';
  };

  const getTrendIcon = (trend) => {
    if (trend.startsWith('+')) return 'fas fa-arrow-up text-success';
    if (trend.startsWith('-')) return 'fas fa-arrow-down text-danger';
    return 'fas fa-minus text-muted';
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">
          <i className="fas fa-chart-line"></i>
          پارامترهای لحظه‌ای
        </h3>
        <div className="card-actions">
          <span className="update-time">
            <i className="fas fa-clock"></i>
            بروزرسانی: هر ۲ ثانیه
          </span>
        </div>
      </div>

      <div className="card-body">
        {/* Gauge Charts Section */}
        <div className="gauges-section">
          <h4 className="section-title">
            <i className="fas fa-tachometer-alt"></i>
            شاخص‌های حیاتی
          </h4>
          <div className="gauges-grid">
            {gaugeMetrics.map((gauge, index) => {
              const percentage = calculateGaugePercentage(gauge.value, gauge.min, gauge.max);
              const statusColor = getStatusColor(gauge.value, gauge.warningThreshold, gauge.dangerThreshold);

              return (
                <div key={gauge.id} className="gauge-card">
                  <div className="gauge-header">
                    <div className="gauge-title">
                      <i className={gauge.icon} style={{ color: gauge.color }}></i>
                      {gauge.title}
                    </div>
                    <div className="gauge-unit">{gauge.unit}</div>
                  </div>

                  <div className="gauge-container">
                    <div className="gauge-background">
                      <div className="gauge-track"></div>
                      <div className="gauge-progress" style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${gauge.color} 0%, ${statusColor} 100%)`
                      }}></div>
                      <div className="gauge-ticks">
                        <span className="tick min">{gauge.min}</span>
                        <span className="tick max">{gauge.max}</span>
                      </div>
                    </div>

                    <div className="gauge-indicator" style={{ left: `${percentage}%` }}>
                      <div className="indicator-line"></div>
                      <div className="indicator-value" style={{ color: statusColor }}>
                        {gauge.value.toLocaleString('fa-IR')}
                      </div>
                    </div>

                    <div className="gauge-thresholds">
                      <div className="threshold warning" style={{ left: `${calculateGaugePercentage(gauge.warningThreshold, gauge.min, gauge.max)}%` }}>
                        <div className="threshold-marker"></div>
                        <div className="threshold-label">هشدار</div>
                      </div>
                      <div className="threshold danger" style={{ left: `${calculateGaugePercentage(gauge.dangerThreshold, gauge.min, gauge.max)}%` }}>
                        <div className="threshold-marker"></div>
                        <div className="threshold-label">خطر</div>
                      </div>
                    </div>
                  </div>

                  <div className="gauge-footer">
                    <div className="gauge-status">
                      <span className="status-dot" style={{ backgroundColor: statusColor }}></span>
                      {gauge.value >= gauge.dangerThreshold ? 'وضعیت خطر' :
                       gauge.value >= gauge.warningThreshold ? 'وضعیت هشدار' : 'وضعیت عادی'}
                    </div>
                    <div className="gauge-range">
                      محدوده: {gauge.min} - {gauge.max}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Numeric Metrics Section */}
        <div className="numeric-section">
          <h4 className="section-title">
            <i className="fas fa-calculator"></i>
            پارامترهای فرآیندی
          </h4>
          <div className="metrics-grid">
            {numericMetrics.map((metric, index) => (
              <div key={metric.id} className={`metric-item ${metric.status}`}>
                <div className="metric-header">
                  <div className="metric-icon">
                    <i className={metric.icon}></i>
                  </div>
                  <div className="metric-info">
                    <div className="metric-title">{metric.title}</div>
                    <div className="metric-unit">{metric.unit}</div>
                  </div>
                  <div className="metric-trend">
                    <i className={getTrendIcon(metric.trend)}></i>
                    <span className="trend-value">{metric.trend}</span>
                  </div>
                </div>

                <div className="metric-value">
                  {metric.value}
                </div>

                <div className="metric-footer">
                  <div className="metric-target">
                    <i className="fas fa-bullseye"></i>
                    هدف: {metric.target}
                  </div>
                  <div className={`metric-status-badge status-${metric.status}`}>
                    {metric.status === 'optimal' && 'بهینه'}
                    {metric.status === 'good' && 'خوب'}
                    {metric.status === 'normal' && 'عادی'}
                    {metric.status === 'warning' && 'نیاز توجه'}
                    {metric.status === 'danger' && 'خطر'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Performance Indicators */}
        <div className="performance-section">
          <h4 className="section-title">
            <i className="fas fa-chart-pie"></i>
            شاخص‌های عملکرد
          </h4>
          <div className="performance-grid">
            <div className="performance-card">
              <div className="performance-header">
                <i className="fas fa-bolt performance-icon"></i>
                <div className="performance-title">کارایی انرژی</div>
              </div>
              <div className="performance-value">92.5%</div>
              <div className="performance-progress">
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    style={{ width: '92.5%' }}
                  ></div>
                </div>
                <div className="progress-labels">
                  <span className="label">پایین</span>
                  <span className="label">هدف</span>
                  <span className="label">عالی</span>
                </div>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-header">
                <i className="fas fa-industry performance-icon"></i>
                <div className="performance-title">بهره‌وری تجهیزات</div>
              </div>
              <div className="performance-value">96.2%</div>
              <div className="performance-progress">
                <div className="progress">
                  <div
                    className="progress-bar bg-info"
                    style={{ width: '96.2%' }}
                  ></div>
                </div>
                <div className="progress-labels">
                  <span className="label">پایین</span>
                  <span className="label">هدف</span>
                  <span className="label">عالی</span>
                </div>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-header">
                <i className="fas fa-chart-line performance-icon"></i>
                <div className="performance-title">کیفیت محصول</div>
              </div>
              <div className="performance-value">98.7%</div>
              <div className="performance-progress">
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    style={{ width: '98.7%' }}
                  ></div>
                </div>
                <div className="progress-labels">
                  <span className="label">پایین</span>
                  <span className="label">هدف</span>
                  <span className="label">عالی</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMetrics;