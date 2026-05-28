// components/Dashboard/WorkOrderAnalytics.jsx
import React from 'react';

const WorkOrderAnalytics = ({ kpis }) => {
  const workOrderStats = [
    { status: 'باز', count: kpis.open_work_orders || 0, color: 'warning', icon: 'fas fa-folder-open' },
    { status: 'در حال انجام', count: kpis.work_orders_in_progress || 0, color: 'info', icon: 'fas fa-tools' },
    { status: 'تکمیل شده امروز', count: kpis.maintenance_completed_today || 0, color: 'success', icon: 'fas fa-check' },
    { status: 'معوق', count: kpis.overdue_work_orders || 0, color: 'danger', icon: 'fas fa-clock' }
  ];

  return (
    <div className="card modern-card">
      <div className="card-header modern-card-header">
        <div className="d-flex align-items-center">
          <div className="header-icon">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div>
            <h5 className="card-title mb-0">آمار دستورکارها</h5>
            <p className="card-subtitle">وضعیت تعمیرات و نگهداری</p>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="workorder-grid">
          {workOrderStats.map((stat, index) => (
            <div key={index} className="workorder-stat">
              <div className={`stat-icon bg-${stat.color}-light`}>
                <i className={`${stat.icon} text-${stat.color}`}></i>
              </div>
              <div className="stat-content">
                <h4 className="stat-value">{stat.count}</h4>
                <p className="stat-label">{stat.status}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="completion-metrics">
          <div className="metric">
            <span>نرخ تکمیل</span>
            <span className="metric-value">{kpis.completion_rate || 85}%</span>
          </div>
          <div className="metric">
            <span>میانگین زمان تکمیل</span>
            <span className="metric-value">{kpis.average_completion_time_hours || 24.5} ساعت</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .workorder-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .workorder-stat {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
        }

        .stat-icon {
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

        .completion-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1rem;
        }

        .metric {
          display: flex;
          justify-content: between;
          align-items: center;
          padding: 0.5rem;
        }

        .metric-value {
          font-weight: 700;
          color: #2c3e50;
        }

        @media (max-width: 768px) {
          .workorder-grid {
            grid-template-columns: 1fr;
          }

          .completion-metrics {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkOrderAnalytics;