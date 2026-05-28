// components/Dashboard/AIInsightsBox.jsx
import React, { useState } from 'react';

const AIInsightsBox = ({ insights }) => {
  const [expanded, setExpanded] = useState(false);

  // Default insights if none provided
  const defaultInsights = {
    prediction_accuracy: 94.2,
    models_active: 3,
    total_predictions: 1247,
    alerts_generated: 28,
    coverage_rate: 87.5,
    avg_response_time: '2.3s',
    top_insights: [
      {
        id: 1,
        type: 'prediction',
        title: 'پیش‌بینی خرابی تجهیزات',
        message: 'کمپرسور A1 با احتمال ۸۷٪ در ۷۲ ساعت آینده نیاز به تعمیر دارد',
        severity: 'high',
        confidence: 87,
        timestamp: '2025-11-05T10:30:00Z',
        action: 'schedule_maintenance'
      },
      {
        id: 2,
        type: 'optimization',
        title: 'بهینه‌سازی مصرف انرژی',
        message: 'کاهش ۱۲٪ مصرف انرژی با تنظیم دمای کارگاه بین ۲۲-۲۴ درجه',
        severity: 'medium',
        confidence: 92,
        timestamp: '2025-11-05T09:15:00Z',
        action: 'adjust_temperature'
      },
      {
        id: 3,
        type: 'maintenance',
        title: 'تعمیرات پیشگیرانه',
        message: 'سیستم هیدرولیک B2 پس از ۴۸۰ ساعت کار نیاز به سرویس دوره‌ای',
        severity: 'medium',
        confidence: 78,
        timestamp: '2025-11-05T08:45:00Z',
        action: 'preventive_maintenance'
      }
    ],
    system_status: 'active',
    last_training: '2025-11-04T22:00:00Z'
  };

  const aiData = insights || defaultInsights;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'gradient-red';
      case 'medium': return 'gradient-orange';
      case 'low': return 'gradient-blue';
      default: return 'gradient-gray';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return 'fas fa-exclamation-triangle';
      case 'medium': return 'fas fa-exclamation-circle';
      case 'low': return 'fas fa-info-circle';
      default: return 'fas fa-circle';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'schedule_maintenance': return 'fas fa-tools';
      case 'adjust_temperature': return 'fas fa-thermometer-half';
      case 'preventive_maintenance': return 'fas fa-shield-alt';
      default: return 'fas fa-cog';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = [
    {
      label: "دقت پیش‌بینی",
      value: `${aiData.prediction_accuracy}%`,
      icon: "fas fa-bullseye",
      color: "text-success",
      trend: "up"
    },
    {
      label: "مدل‌های فعال",
      value: aiData.models_active,
      icon: "fas fa-brain",
      color: "text-primary",
      trend: "stable"
    },
    {
      label: "پیش‌بینی‌ها",
      value: aiData.total_predictions.toLocaleString('fa-IR'),
      icon: "fas fa-chart-line",
      color: "text-info",
      trend: "up"
    },
    {
      label: "پوشش سیستم",
      value: `${aiData.coverage_rate}%`,
      icon: "fas fa-shield-alt",
      color: "text-warning",
      trend: "stable"
    }
  ];

  const visibleInsights = expanded ? aiData.top_insights : aiData.top_insights.slice(0, 2);

  return (
    <div className="card modern-card ai-insights-card">
      <div className="card-header modern-card-header">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="header-icon ai-pulse">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <h5 className="card-title mb-0">هوش مصنوعی و تحلیل‌های پیشرفته</h5>
              <p className="card-subtitle">بینش‌های هوشمند برای مدیریت بهینه</p>
            </div>
          </div>
          <div className={`status-badge ${aiData.system_status === 'active' ? 'status-active' : 'status-inactive'}`}>
            <i className="fas fa-circle"></i>
            {aiData.system_status === 'active' ? 'فعال' : 'غیرفعال'}
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* AI Performance Stats */}
        <div className="stats-grid compact">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item compact">
              <div className="stat-icon-wrapper">
                <i className={`${stat.icon} ${stat.color}`}></i>
                {stat.trend === 'up' && <span className="trend-indicator up">↑</span>}
                {stat.trend === 'down' && <span className="trend-indicator down">↓</span>}
              </div>
              <div className="stat-content">
                <h4 className="stat-value">{stat.value}</h4>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights List */}
        <div className="insights-section">
          <div className="section-header">
            <h6>بینش‌های هوشمند</h6>
            <span className="insights-count">
              {aiData.alerts_generated} هشدار امروز
            </span>
          </div>

          <div className="insights-list">
            {visibleInsights.map((insight) => (
              <div key={insight.id} className={`insight-item ${getSeverityColor(insight.severity)}`}>
                <div className="insight-severity">
                  <i className={getSeverityIcon(insight.severity)}></i>
                </div>
                <div className="insight-content">
                  <div className="insight-header">
                    <h6 className="insight-title">{insight.title}</h6>
                    <div className="insight-meta">
                      <span className="confidence-badge">
                        {insight.confidence}% اطمینان
                      </span>
                      <span className="time-badge">
                        <i className="fas fa-clock"></i>
                        {formatTime(insight.timestamp)}
                      </span>
                    </div>
                  </div>
                  <p className="insight-message">{insight.message}</p>
                  <div className="insight-actions">
                    <button className="btn-action">
                      <i className={getActionIcon(insight.action)}></i>
                      اقدام
                    </button>
                    <button className="btn-details">
                      <i className="fas fa-chevron-left"></i>
                      جزئیات
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {aiData.top_insights.length > 2 && (
            <div className="expand-section">
              <button
                className="btn-expand"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <i className="fas fa-chevron-up"></i>
                    نمایش کمتر
                  </>
                ) : (
                  <>
                    <i className="fas fa-chevron-down"></i>
                    نمایش بینش‌های بیشتر
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="system-info">
          <div className="system-stats">
            <div className="system-stat">
              <i className="fas fa-bolt text-warning"></i>
              <span>زمان پاسخ: {aiData.avg_response_time}</span>
            </div>
            <div className="system-stat">
              <i className="fas fa-sync-alt text-info"></i>
              <span>آخرین آموزش: {new Date(aiData.last_training).toLocaleDateString('fa-IR')}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ai-insights-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          background: #ffffff;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .ai-insights-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .modern-card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border: none;
        }

        .header-icon.ai-pulse {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 15px;
          font-size: 1.2rem;
          position: relative;
        }

        .ai-pulse::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.3);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-active {
          background: rgba(46, 204, 113, 0.2);
          color: #27ae60;
        }

        .status-inactive {
          background: rgba(231, 76, 60, 0.2);
          color: #c0392b;
        }

        .card-body {
          padding: 24px;
        }

        /* Compact Stats Grid */
        .stats-grid.compact {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-item.compact {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .stat-item.compact:hover {
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 12px;
          font-size: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .trend-indicator {
          position: absolute;
          top: -4px;
          left: -4px;
          font-size: 0.6rem;
          padding: 2px 4px;
          border-radius: 8px;
          color: white;
          font-weight: bold;
        }

        .trend-indicator.up {
          background: #27ae60;
        }

        .trend-indicator.down {
          background: #e74c3c;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #2c3e50, #3498db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Insights Section */
        .insights-section {
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h6 {
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
        }

        .insights-count {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .insights-list {
          space-y: 12px;
        }

        .insight-item {
          display: flex;
          background: white;
          border-radius: 12px;
          padding: 16px;
          border-right: 4px solid;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .insight-item:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transform: translateX(4px);
        }

        .insight-severity {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 12px;
          font-size: 1.1rem;
          color: white;
          flex-shrink: 0;
        }

        .insight-content {
          flex: 1;
        }

        .insight-header {
          display: flex;
          justify-content: between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .insight-title {
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
          font-size: 0.9rem;
          flex: 1;
        }

        .insight-meta {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .confidence-badge, .time-badge {
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .confidence-badge {
          background: rgba(52, 152, 219, 0.1);
          color: #2980b9;
        }

        .time-badge {
          background: rgba(108, 117, 125, 0.1);
          color: #6c757d;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .insight-message {
          font-size: 0.85rem;
          color: #5a6c7d;
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .insight-actions {
          display: flex;
          gap: 8px;
        }

        .btn-action, .btn-details {
          padding: 6px 12px;
          border: none;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-action {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .btn-details {
          background: #f8f9fa;
          color: #6c757d;
        }

        .btn-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }

        .btn-details:hover {
          background: #e9ecef;
        }

        /* Expand Section */
        .expand-section {
          text-align: center;
          margin-top: 16px;
        }

        .btn-expand {
          background: none;
          border: none;
          color: #667eea;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0 auto;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .btn-expand:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        /* System Info */
        .system-info {
          border-top: 1px solid #e9ecef;
          padding-top: 16px;
        }

        .system-stats {
          display: flex;
          justify-content: space-around;
          gap: 16px;
        }

        .system-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #6c757d;
        }

        /* Gradient Classes */
        .gradient-red { border-right-color: #e74c3c; }
        .gradient-orange { border-right-color: #e67e22; }
        .gradient-blue { border-right-color: #3498db; }
        .gradient-gray { border-right-color: #95a5a6; }

        .gradient-red .insight-severity { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .gradient-orange .insight-severity { background: linear-gradient(135deg, #e67e22, #d35400); }
        .gradient-blue .insight-severity { background: linear-gradient(135deg, #3498db, #2980b9); }
        .gradient-gray .insight-severity { background: linear-gradient(135deg, #95a5a6, #7f8c8d); }

        /* Responsive Design */
        @media (max-width: 768px) {
          .stats-grid.compact {
            grid-template-columns: 1fr;
          }

          .insight-header {
            flex-direction: column;
            gap: 8px;
          }

          .insight-meta {
            align-self: flex-start;
          }

          .system-stats {
            flex-direction: column;
            gap: 8px;
          }
        }

        @media (max-width: 480px) {
          .modern-card-header {
            padding: 20px;
          }

          .card-body {
            padding: 20px;
          }

          .insight-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AIInsightsBox;