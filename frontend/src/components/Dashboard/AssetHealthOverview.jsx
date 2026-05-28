// components/Dashboard/AssetHealthOverview.jsx
import React from 'react';

const AssetHealthOverview = ({ kpis }) => {
  const healthData = [
    { status: 'سالم', count: kpis.healthy_assets || 0, color: 'success', icon: 'fas fa-check-circle' },
    { status: 'هشدار', count: kpis.warning_assets || 0, color: 'warning', icon: 'fas fa-exclamation-triangle' },
    { status: 'بحرانی', count: kpis.critical_assets || 0, color: 'danger', icon: 'fas fa-times-circle' }
  ];

  return (
    <div className="card modern-card">
      <div className="card-header modern-card-header">
        <div className="d-flex align-items-center">
          <div className="header-icon">
            <i className="fas fa-heartbeat"></i>
          </div>
          <div>
            <h5 className="card-title mb-0">وضعیت سلامت تجهیزات</h5>
            <p className="card-subtitle">بررسی کلی وضعیت فنی دستگاه‌ها</p>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="health-stats">
          {healthData.map((item, index) => (
            <div key={index} className="health-stat-item">
              <div className={`stat-indicator bg-${item.color}-light`}>
                <i className={`${item.icon} text-${item.color}`}></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-value">{item.count}</h4>
                <p className="stat-label">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="health-summary">
          <div className="progress-bar-container">
            <div
              className="progress-bar bg-success"
              style={{ width: `${((kpis.healthy_assets || 0) / (kpis.total_active_assets || 1)) * 100}%` }}
            ></div>
            <div
              className="progress-bar bg-warning"
              style={{ width: `${((kpis.warning_assets || 0) / (kpis.total_active_assets || 1)) * 100}%` }}
            ></div>
            <div
              className="progress-bar bg-danger"
              style={{ width: `${((kpis.critical_assets || 0) / (kpis.total_active_assets || 1)) * 100}%` }}
            ></div>
          </div>
          <div className="summary-text">
            <span>میانگین سلامت: {kpis.asset_health_index_avg || 0}%</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .health-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .health-stat-item {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
        }

        .stat-indicator {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 1rem;
          font-size: 1.2rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6c757d;
          margin: 0;
        }

        .health-summary {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
        }

        .progress-bar-container {
          height: 8px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          height: 100%;
          transition: width 0.5s ease;
        }

        .summary-text {
          text-align: center;
          font-weight: 600;
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .health-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AssetHealthOverview;