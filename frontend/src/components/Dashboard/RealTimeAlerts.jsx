// components/Dashboard/RealTimeAlerts.jsx
import React from 'react';

const RealTimeAlerts = ({ alerts }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return 'fas fa-exclamation-triangle text-danger';
      case 'medium': return 'fas fa-exclamation-circle text-warning';
      case 'low': return 'fas fa-info-circle text-info';
      default: return 'fas fa-circle text-secondary';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high': return 'بحرانی';
      case 'medium': return 'هشدار';
      case 'low': return 'اطلاع';
      default: return 'عمومی';
    }
  };

  return (
    <div className="card modern-card" style={{marginTop:"5px"}}>
      <div className="card-header modern-card-header">
        <div className="d-flex align-items-center">
          <div className="header-icon">
            <i className="fas fa-bell"></i>
          </div>
          <div>
            <h5 className="card-title mb-0">هشدارهای لحظه‌ای</h5>
            <p className="card-subtitle">اخبار و اعلانات سیستم</p>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="alerts-list">
          {alerts.slice(0, 5).map((alert, index) => (
            <div key={alert.id} className="alert-item" style={{marginTop:"5px"}}>
              <div className="alert-icon">
                <i className={getSeverityIcon(alert.severity)}></i>
              </div>
              <div className="alert-content">
                <h6 className="alert-title">{alert.title}</h6>
                <p className="alert-message">{alert.message}</p>
                <div className="alert-meta">
                  <span className="alert-severity">
                    {getSeverityText(alert.severity)}
                  </span>
                  <span className="alert-time">
                    {new Date(alert.timestamp).toLocaleTimeString('fa-IR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="no-alerts">
            <i className="fas fa-check-circle text-success"></i>
            <p>هیچ هشداری وجود ندارد</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .alerts-list {
          space-y: 1rem;


        }

        .alert-item {
          display: flex;
          align-items: flex-start;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
          border-right: 3px solid;
        }

        .alert-item:first-child {
          border-right-color: #e74c3c;
        }

        .alert-item:nth-child(2) {
          border-right-color: #e67e22;
        }

        .alert-item:nth-child(3) {
          border-right-color: #3498db;
        }

        .alert-icon {
          font-size: 1.2rem;
          margin-left: 1rem;
          margin-top: 0.25rem;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #2c3e50;
        }

        .alert-message {
          font-size: 0.85rem;
          color: #5a6c7d;
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
        }

        .alert-meta {
          display: flex;
          justify-content: between;
          align-items: center;
        }

        .alert-severity, .alert-time {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .alert-severity {
          color: #e74c3c;
        }

        .alert-time {
          color: #6c757d;
        }

        .no-alerts {
          text-align: center;
          padding: 2rem 1rem;
          color: #6c757d;
        }

        .no-alerts i {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .alert-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RealTimeAlerts;