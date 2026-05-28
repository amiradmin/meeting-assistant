// components/Dashboard/EmployeeAnalysis.jsx
import React from 'react';

const EmployeeAnalysis = ({ employees }) => {
  const stats = [
    {
      label: "کل کارکنان",
      value: employees.total_employees || 0,
      icon: "fas fa-users",
      color: "text-primary",
      bgColor: "bg-primary-light",
      borderColor: "border-primary"
    },
    {
      label: "کارکنان فعال",
      value: employees.active_employees || 0,
      icon: "fas fa-user-check",
      color: "text-success",
      bgColor: "bg-success-light",
      borderColor: "border-success"
    },
    {
      label: "کارکنان غیرفعال",
      value: employees.inactive_employees || 0,
      icon: "fas fa-user-clock",
      color: "text-warning",
      bgColor: "bg-warning-light",
      borderColor: "border-warning"
    },
    {
      label: "نرخ فعالیت",
      value: `${employees.activity_rate || 0}%`,
      icon: "fas fa-chart-line",
      color: "text-info",
      bgColor: "bg-info-light",
      borderColor: "border-info"
    }
  ];

  // Color palette for role distribution
  const roleColors = [
    "bg-gradient-primary",
    "bg-gradient-success",
    "bg-gradient-warning",
    "bg-gradient-info",
    "bg-gradient-danger",
    "bg-gradient-secondary"
  ];

  return (
    <div className="card modern-card employee-analysis-card">
      <div className="card-header modern-card-header">
        <div className="d-flex align-items-center">
          <div className="header-icon">
            <i className="fas fa-chart-pie"></i>
          </div>
          <div>
            <h5 className="card-title mb-0">تجزیه و تحلیل کارکنان</h5>
            <p className="card-subtitle">بررسی وضعیت پرسنل و توزیع نقش‌ها</p>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Statistics Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className={`stat-icon ${stat.bgColor} ${stat.color}`}>
                <i className={stat.icon}></i>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Role Distribution */}
        {employees.roles_breakdown && employees.roles_breakdown.length > 0 && (
          <div className="role-distribution">
            <div className="section-header">
              <h6>توزیع بر اساس نقش</h6>
              <span className="total-badge">
                کل: {employees.total_employees}
              </span>
            </div>

            <div className="roles-list">
              {employees.roles_breakdown.map((role, index) => {
                const percentage = ((role.count / employees.total_employees) * 100).toFixed(1);
                const colorClass = roleColors[index % roleColors.length];

                return (
                  <div key={index} className="role-item">
                    <div className="role-info">
                      <div className="role-header">
                        <span className="role-name">{role.role || 'بدون نقش'}</span>
                        <span className="role-count">{role.count} نفر</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar ${colorClass}`}
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="progress-text">{percentage}%</span>
                        </div>
                      </div>
                    </div>
                    <div className={`role-badge ${colorClass}`}>
                      {role.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modern-card {
          border: none;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          background: #ffffff;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .modern-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }

        .modern-card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          border: none;
        }

        .modern-card-header .header-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 15px;
          font-size: 1.2rem;
        }

        .card-title {
          font-weight: 700;
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .card-subtitle {
          font-size: 0.85rem;
          opacity: 0.9;
          margin: 0;
        }

        .card-body {
          padding: 24px;
        }

        /* Statistics Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          background: #f8f9fa;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          border: 1px solid #f1f3f4;
        }

        .stat-item:hover {
          background: #ffffff;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          margin-left: 15px;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
          line-height: 1;
          background: linear-gradient(135deg, #2c3e50, #3498db);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6c757d;
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        /* Role Distribution */
        .role-distribution {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 20px;
        }

        .section-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h6 {
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
          flex: 1;
        }

        .total-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .roles-list {
          space-y: 12px;
        }

        .role-item {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .role-item:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transform: translateX(4px);
        }

        .role-item:last-child {
          margin-bottom: 0;
        }

        .role-info {
          flex: 1;
        }

        .role-header {
          display: flex;
          justify-content: between;
          align-items: center;
          margin-bottom: 8px;
        }

        .role-name {
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .role-count {
          font-size: 0.8rem;
          color: #6c757d;
          font-weight: 500;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          border-radius: 10px;
          position: relative;
          transition: width 0.8s ease;
        }

        .progress-text {
          position: absolute;
          right: 8px;
          top: -20px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .role-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          margin-right: 12px;
          flex-shrink: 0;
        }

        /* Gradient Background Classes */
        .bg-primary-light { background: rgba(52, 152, 219, 0.1); }
        .bg-success-light { background: rgba(46, 204, 113, 0.1); }
        .bg-warning-light { background: rgba(241, 196, 15, 0.1); }
        .bg-info-light { background: rgba(52, 152, 219, 0.1); }

        .bg-gradient-primary { background: linear-gradient(135deg, #667eea, #764ba2); }
        .bg-gradient-success { background: linear-gradient(135deg, #4ecdc4, #44a08d); }
        .bg-gradient-warning { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .bg-gradient-info { background: linear-gradient(135deg, #4facfe, #00f2fe); }
        .bg-gradient-danger { background: linear-gradient(135deg, #fa709a, #fee140); }
        .bg-gradient-secondary { background: linear-gradient(135deg, #a8edea, #fed6e3); }

        /* Responsive Design */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .stat-item {
            padding: 16px;
          }

          .stat-value {
            font-size: 1.5rem;
          }

          .modern-card-header {
            padding: 20px;
          }

          .card-body {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .role-item {
            flex-direction: column;
            text-align: center;
          }

          .role-badge {
            margin: 8px 0 0 0;
          }

          .role-header {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeAnalysis;